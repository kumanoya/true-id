import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  PublicAccount,
  Address,
  Deadline,
  UInt64,
  Listener,
  Mosaic,
  MosaicId,
  PlainMessage,
  Transaction,
  NamespaceRegistrationTransaction,
  TransactionGroup,
  RepositoryFactoryHttp,
  SignedTransaction,
  Account,
  Order,
} from 'symbol-sdk';

import {
  currencyMosaicID,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

//import { connectNode } from '@/utils/connectNode';
//import { nodeList } from '@/consts/nodeList';

import useSssInit from '@/hooks/useSssInit';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from "react-hook-form";

const NODE = "https://sym-test-03.opening-line.jp:3001";
//const NODE = await connectNode(nodeList);
//if (NODE === '') return undefined;

const repo = new RepositoryFactoryHttp(NODE, {
  websocketUrl: NODE.replace('http', 'ws') + '/ws',
  websocketInjected: WebSocket,
});

function createNamespaceRegistrationTransaction(rootNameSpace: string): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6; // XYMの分割単位

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

function Home(): JSX.Element {

  //共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const router = useRouter();

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();
  const [clientAddress, setClientAddress] = useState<string>('');
  // CUSTOM REACTIVE VARIABLES
  const [address, setAddress] = useState<Address>();

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([]);

  //SSS用設定
  interface SSSWindow extends Window {
    SSS: any;
    isAllowedSSS: () => boolean;
  }
  declare const window: SSSWindow;

  useEffect(() => {
    if (sssState === 'ACTIVE') {
      const clientPublicAccount = PublicAccount.createFromPublicKey(clientPublicKey, networkType);
      setClientAddress(clientPublicAccount.address.plain());
    } else if (sssState === 'INACTIVE' || sssState === 'NONE') {
      router.push('/sss');
    }
  }, [clientPublicKey, sssState, router]);


  type Inputs = {
    rootNameSpace: string;
  };

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      setAddress(Address.createFromRawAddress(clientAddress));
    }
  }, [clientAddress, sssState]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      (async() => {
        const txRepo = repo.createTransactionRepository();
        const accountRepo = repo.createAccountRepository();

        //clientAddressからAccountInfoを導出
        const clientAccountInfo = await firstValueFrom(
          accountRepo.getAccountInfo(Address.createFromRawAddress(clientAddress))
        );
        const resultSearch = await firstValueFrom(
          txRepo.search({
            // type: [TransactionType.AGGREGATE_BONDED],
            group: TransactionGroup.Confirmed,
            address: clientAccountInfo.address,
            order: Order.Desc,
            pageSize: 100,
          })
        );
        console.log('resultSearch :', resultSearch);
        setDataList(resultSearch.data);

        // Start monitoring of transaction status with websocket
        const address = Address.createFromRawAddress(clientAddress);
        const listener = repo.createListener();
        await listener.open();
        listener
          .confirmed(address)
          .subscribe((confirmedTx: Transaction) => {
            console.log("EVENT: TRANSACTION CONFIRMED");
            //console.dir({ confirmedTx }, { depth: null });
            setDataList(current => [confirmedTx, ...current]);
          });
      })();
    }
  },  [clientAddress, sssState]);

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // SUBMIT LOGIC
  const submit: SubmitHandler<Inputs> = (data) => {
      const transferTx = createNamespaceRegistrationTransaction(data.rootNameSpace);

      console.log("SUBMIT:");
      console.log(transferTx);
      window.SSS.setTransaction(transferTx);

      (async () => {
        const signedTx: SignedTransaction = await new Promise((resolve) => {
          resolve(window.SSS.requestSign());
        });

        const txRepo = repo.createTransactionRepository();
        txRepo.announce(signedTx);
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
            管理
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(submit)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                ルートネームスペース
              </label>
              <input
                {...register("rootNameSpace", { required: "ネームスペースを入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNameSpace"
              />
            </div>

            <button>送信</button>
          </form>
        </Box>
      )}
      <table>
        <thead>
          <tr>
            <th>メッセージ</th>
            <th>送信元</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td>{ data?.message?.payload }</td>
              <td>{ data.signer.address.address }</td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}
export default Home;
