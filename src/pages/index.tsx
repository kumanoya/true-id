import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  Address,
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  NamespaceName,
  NamespaceId,
  PlainMessage,
  Transaction,
  TransferTransaction,
  TransactionGroup,
  TransactionType,
  Order,
} from 'symbol-sdk';

import {
  currencyMosaicID,
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

function createMessageTx(recipientName: string, rawMessage: string, xym: number): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6; // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  //const recipientAddress = Address.createFromRawAddress(recipientName);
  const recipientNameId = new NamespaceId(recipientName);
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
    //recipientAddress,
    recipientNameId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier);

  return transferTransaction;
}

async function getMessageTxs(address: Address): Promise<Transaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  );
  console.log('resultSearch :', resultSearch);
  return resultSearch.data as Transaction[];
}

function Home(): JSX.Element {

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([]);

  const [accountNames, setAccountNames] = useState<string[]>([]);
  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        repo.createNamespaceRepository().getAccountsNames([address]).subscribe((names) => {
          console.log("NAMES[]: ", names)
          const accountNames = names[0].names.map((namespaceName: NamespaceName) => namespaceName.name).sort()
          setAccountNames(accountNames)
        })

        setDataList(await getMessageTxs(address));

        // Start monitoring of transaction status with websocket
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
  },  [address, sssState]);

  type Inputs = {
    recipientName: string;
    message: string;
    xym: number;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // SUBMIT LOGIC
  const sendMessage: SubmitHandler<Inputs> = (data) => {
    signTx(
      createMessageTx(data.recipientName, data.message, data.xym)
    )
  }

  //View共通設定
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
            あなたのアドレス
          </Typography>
          <ul>
            {accountNames.map((name) => (
              <li key={name}>
                <span>{ name }</span>
              </li>
            ))}
          </ul>
          { address.plain() }
          <form onSubmit={handleSubmit(sendMessage)} className="m-4 px-8 py-4 border w-full max-w-120 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                アカウント名
              </label>
              <input
                {...register("recipientName", { required: "宛先アドレスを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="recipientName"
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
