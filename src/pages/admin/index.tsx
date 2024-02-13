import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  Address,
  Deadline,
  UInt64,
  Transaction,
  TransactionType,
  NamespaceRegistrationTransaction,
  TransactionGroup,
  SignedTransaction,

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

function createNamespaceRegistrationTransaction(rootNameSpace: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const day = 60;
  const duration = UInt64.fromUint((24 * 60 * 60) / 30 * day);

  const feeMultiplier = 100; // トランザクション手数料に影響する。現時点ではデフォルトのノードは手数料倍率が100で、多くのノードがこれ以下の数値を指定しており、100を指定しておけば素早く承認される傾向。

  // Create transaction
  const namespaceRegistrationTransaction = NamespaceRegistrationTransaction.createRootNamespace(
    deadline,
    rootNameSpace,
    duration,
    networkType
  ).setMaxFee(feeMultiplier);

  return namespaceRegistrationTransaction;
}

function createAliasTransaction(rootNameSpace: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100; // トランザクション手数料に影響する。現時点ではデフォルトのノードは手数料倍率が100で、多くのノードがこれ以下の数値を指定しており、100を指定しておけば素早く承認される傾向。

  // Create transaction
  //(deadline, aliasAction, namespaceId, address, networkType)
  const aliasTransaction = AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(rootNameSpace),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
}

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
  isAllowedSSS: () => boolean;
}
declare const window: SSSWindow;

function Home(): JSX.Element {

  //共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { clientAddress, address } = useAddressInit(clientPublicKey, sssState);

  // ルートネームスペース一覧表示用
  const [nsTxList, setNsTxList] = useState<NamespaceRegistrationTransaction[]>([]);

  // ルートネームスペース一覧表示用
  const [aliasTxDict, setAliasTxDict] = useState<{ [id: string]: AliasTransaction }>({});

  async function getNamespaceRegistrationTransactions() {
        const txRepo = repo.createTransactionRepository();
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
        setNsTxList(resultSearch.data as NamespaceRegistrationTransaction[]);
  }

  async function getAliasTransactions() {
        const txRepo = repo.createTransactionRepository();
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
        setAliasTxDict(aliasTxDict);
  }

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        getNamespaceRegistrationTransactions();

        const listener = repo.createListener();
        await listener.open();
        listener
          .confirmed(address)
          .subscribe((confirmedTx: Transaction) => {
            console.log("EVENT: TRANSACTION CONFIRMED");
            //console.dir({ confirmedTx }, { depth: null });
            setNsTxList(current => [confirmedTx as NamespaceRegistrationTransaction, ...current]);
          });
        getAliasTransactions();
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

  // SUBMIT LOGIC
  const submit: SubmitHandler<Inputs> = (data) => {
      (async () => {
        const txRepo = repo.createTransactionRepository();

        // Namespace登録
        const registrationTx = createNamespaceRegistrationTransaction(data.rootNameSpace);
        window.SSS.setTransaction(registrationTx);

        const signedTx: SignedTransaction = await new Promise((resolve) => {
          resolve(window.SSS.requestSign());
        });
        await firstValueFrom(txRepo.announce(signedTx));

      })();
  }

  const createAlias = (data: NamespaceRegistrationTransaction) => {
    (async () => {
      const txRepo = repo.createTransactionRepository();

      // Namespaceと自分のAddressを紐づける
      const aliasTx = createAliasTransaction(data.namespaceName, Address.createFromRawAddress(clientAddress));
      window.SSS.setTransaction(aliasTx);
      const signedAliasTx: SignedTransaction = await new Promise((resolve) => {
        resolve(window.SSS.requestSign());
      });
      txRepo.announce(signedAliasTx);
    })();
  }

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
          <form onSubmit={handleSubmit(submit)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
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
