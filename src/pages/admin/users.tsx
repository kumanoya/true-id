"use client";

import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  Address,
  Deadline,
  Transaction,
  TransactionType,
  NamespaceRegistrationTransaction,
  TransactionGroup,

  AliasTransaction,
  AliasAction,
  NamespaceId,
  Order,
} from 'symbol-sdk';

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { useForm, SubmitHandler } from "react-hook-form";

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

import { signTx } from '@/utils/signTx';

import { useSearchParams } from 'next/navigation';

function createSubNamespaceRegistrationTx(parentNamespace: string, namespaceName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  console.log('parentNamespace:', parentNamespace);
  console.log('namespaceName:', namespaceName);
  // Create transaction
  const namespaceRegistrationTransaction = NamespaceRegistrationTransaction.createSubNamespace(
    deadline,
    namespaceName,
    parentNamespace,
    networkType
  ).setMaxFee(feeMultiplier);

  return namespaceRegistrationTransaction;
}

function createSubNamespaceAliasTx(parentNamespace: string, namespaceName: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const aliasTransaction = AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(parentNamespace + '.' + namespaceName),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
}

async function getSubNamespaceRegistrationTxs(address: Address): Promise<NamespaceRegistrationTransaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.NAMESPACE_REGISTRATION],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  );
  console.log('NS_RAGISTRATION TXS:', resultSearch);
  // SubNamespaceのみを抽出
  const txs = resultSearch.data.filter((tx) => {
    return (tx as NamespaceRegistrationTransaction).registrationType === 1;
  });
  // resultSearch.dataには実際にはNamespaceRegistrationTransaction[]が入っている
  return txs as NamespaceRegistrationTransaction[];
}

// TODO: TxではなくNamespaceInfoでの取得に切り替える
async function getAliasTxs(address: Address): Promise<{ [id: string]: AliasTransaction }> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.ADDRESS_ALIAS],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  );
  console.log('ADDRESS_ALIAS TXS:', resultSearch);
  // resultSearch.dataにはAliasTransaction[]が入っている
  // これを、NamespaceIdをキーとした連想配列に変換する
  const aliasTxDict: { [id: string]: AliasTransaction } = {};
  for (const tx of resultSearch.data as AliasTransaction[]) {
    aliasTxDict[tx.namespaceId.toHex()] = tx;
  }
  return aliasTxDict;
}

function Home(): JSX.Element {

  const searchParams = useSearchParams();
  const parentNamespace = searchParams.get('parentNamespace') as string;

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { clientAddress, address } = useAddressInit(clientPublicKey, sssState);

  // ユーザーID（サブネームスペース）一覧表示用
  const [nsTxList, setNsTxList] = useState<NamespaceRegistrationTransaction[]>([]);
  const [aliasTxDict, setAliasTxDict] = useState<{ [id: string]: AliasTransaction }>({});

  // トランザクションのCONFIRMEDを監視
  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        setNsTxList(await getSubNamespaceRegistrationTxs(address));

        const listener = repo.createListener();
        await listener.open();
        listener
          .confirmed(address)
          .subscribe((confirmedTx: Transaction) => {
            console.log("EVENT: TRANSACTION CONFIRMED");
            setNsTxList(current => [confirmedTx as NamespaceRegistrationTransaction, ...current]);
          });
        setAliasTxDict(await getAliasTxs(address));
      })();
    }
  },  [address, sssState]);

  type Inputs = {
    namespaceName: string;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // Namespace登録
  const registerNamespace: SubmitHandler<Inputs> = (data) => {
    signTx(
      createSubNamespaceRegistrationTx(parentNamespace, data.namespaceName)
    )
  }

  // NamespaceとAddressを紐づける
  const createAlias = (data: NamespaceRegistrationTransaction) => {
    signTx(
      createSubNamespaceAliasTx(parentNamespace, data.namespaceName, Address.createFromRawAddress(clientAddress))
    )
  }

  // View共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />

      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            { parentNamespace } ユーザーID管理
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(registerNamespace)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                名前
              </label>
              <input
                {...register("namespaceName", { required: "ID(サブネームスペース）を入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="namespaceName"
              />
            </div>

            <button>追加</button>
          </form>
        </Box>
      )}
      <table>
        <thead>
          <tr>
            <th>ユーザーID</th>
            <th>割当先</th>
          </tr>
        </thead>
        <tbody>
          {nsTxList.map((data, index) => (
            <tr key={index}>
              <td>{ data.namespaceName }</td>
              <td>
                { aliasTxDict[data.namespaceId.toHex()] ? (
                  aliasTxDict[data.namespaceId.toHex()].address.pretty()
                ) : (
                  <button onClick={() => createAlias(data)} className="px-4">割当</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}
export default Home;
