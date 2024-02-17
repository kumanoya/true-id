import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import {
  Address,
  Deadline,
  UInt64,
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

function createNamespaceRegistrationTx(rootNameSpace: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const day = 60;
  const duration = UInt64.fromUint((24 * 60 * 60) / 30 * day);
  const feeMultiplier = 100; 

  // Create transaction
  return  NamespaceRegistrationTransaction.createRootNamespace(
    deadline,
    rootNameSpace,
    duration,
    networkType
  ).setMaxFee(feeMultiplier);
}

function createAliasTx(rootNameSpace: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100; 

  // Create transaction
  return AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(rootNameSpace),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);
}

async function getNamespaceRegistrationTxs(address: Address): Promise<NamespaceRegistrationTransaction[]> {
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
  // resultSearch.dataには実際にはNamespaceRegistrationTransaction[]が入っている
  // dataのタイプを変換する
  return resultSearch.data as NamespaceRegistrationTransaction[];
}

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

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // ルートネームスペース一覧表示用
  const [nsTxList, setNsTxList] = useState<NamespaceRegistrationTransaction[]>([]);
  const [aliasTxDict, setAliasTxDict] = useState<{ [id: string]: AliasTransaction }>({});

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        setNsTxList(await getNamespaceRegistrationTxs(address));

        const listener = repo.createListener();
        await listener.open();
        listener
          .confirmed(address)
          .subscribe((confirmedTx: Transaction) => {
            console.log("EVENT: TRANSACTION CONFIRMED");
            //console.dir({ confirmedTx }, { depth: null });
            setNsTxList(current => [confirmedTx as NamespaceRegistrationTransaction, ...current]);
          });
        setAliasTxDict(await getAliasTxs(address));
      })();
    }
  },  [address, sssState]);

  type Inputs = {
    rootNameSpace: string;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // Namespace登録
  const registerNamespace: SubmitHandler<Inputs> = (data) => {
    signTx(
      createNamespaceRegistrationTx(data.rootNameSpace)
    )
  }

  // NamespaceとAddressを紐づける
  const createAlias = (data: NamespaceRegistrationTransaction) => {
    if (!address) {
      return;
    }
    signTx(
      createAliasTx(data.namespaceName, address)
    )
  }

  //View共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const router = useRouter();
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
            ルートネームスペース管理
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(registerNamespace)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                名前
              </label>
              <input
                {...register("rootNameSpace", { required: "ネームスペースを入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNameSpace"
              />
            </div>

            <button>追加</button>
          </form>
        </Box>
      )}
      <table>
        <thead>
          <tr>
            <th>ルートネームスペース名</th>
            <th>割当先</th>
          </tr>
        </thead>
        <tbody>
          {nsTxList.map((data, index) => (
            <tr key={index}>
              <td
                onClick={() => {
                  router.push({
                    pathname: '/admin/users',
                    query: { parentNamespace: data.namespaceName
                  }});
                }}
              >
                { data.namespaceName }
              </td>
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
