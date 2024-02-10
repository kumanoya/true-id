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
  TransferTransaction,
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

function createMessageTransaction(recipientRawAddress: string, rawMessage: string, xym: number): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6; // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const recipientAddress = Address.createFromRawAddress(recipientRawAddress);
  const absoluteAmount =
    xym * parseInt("1" + "0".repeat(networkCurrencyDivisibility)); // networkCurrencyDivisibility = 6 => 1[XYM] = 10^6[μXYM]
  const absoluteAmountUInt64 = UInt64.fromUint(absoluteAmount);
  const mosaic = new Mosaic(new MosaicId(currencyMosaicID), absoluteAmountUInt64);
  const mosaics = [mosaic];
  const plainMessage = PlainMessage.create(rawMessage); // 平文メッセージ
  const feeMultiplier = 100; // トランザクション手数料に影響する。現時点ではデフォルトのノードは手数料倍率が100で、多くのノードがこれ以下の数値を指定しており、100を指定しておけば素早く承認される傾向。

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    recipientAddress,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier);

  return transferTransaction;
}

function Home(): JSX.Element {

  async function setupListener(address: Address): Promise<void>
  {
    // Start monitoring of transaction status with websocket
    const listener = repo.createListener();
    await listener.open();
    /*
    listener.status(address).subscribe((status: any) => {
      console.dir({ status }, { depth: null });
      listener.close();
      console.log("Transaction status error");
    });
    listener
      .unconfirmedAdded(address)
      .subscribe((unconfirmedTransaction: Transaction) => {
        console.log("EVENT: Transaction unconfirmed");
        //console.dir({ unconfirmedTransaction }, { depth: null });
      });
    */
    listener
      .confirmed(address)
      .subscribe((confirmedTransaction: Transaction) => {
        listener.close();
        console.log("EVENT: Transaction confirmed");
        console.dir({ confirmedTransaction }, { depth: null });
        // XXX: dataListが更新されない
        setDataList([...dataList, confirmedTransaction]);
      });
  }

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
    recipientRawAddress: string;
    message: string;
    xym: number;
  };

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      setAddress(Address.createFromRawAddress(clientAddress));
    }
  }, [clientAddress, sssState]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      setupListener(Address.createFromRawAddress(clientAddress));
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
      })();
    }
  },  [clientAddress, sssState]);

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // SUBMIT LOGIC
  const submit: SubmitHandler<Inputs> = (data) => {
      const transferTx = createMessageTransaction(data.recipientRawAddress, data.message, data.xym);

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
            あなたのアドレス
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(submit)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                宛先アドレス
              </label>
              <input
                {...register("recipientRawAddress", { required: "宛先アドレスを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="recipientRawAddress"
              />
            </div>

            <div className="flex flex-col">
              <label className="w-32">
                メッセージ
              </label>
              <textarea
                {...register("message", { required: "messageを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none h-80"
                name="message"
              />
            </div>

            <div className="flex flex-col">
              <label className="w-32">
                xym
              </label>
              <input
                {...register("xym", { required: "xymを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="xym"
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
