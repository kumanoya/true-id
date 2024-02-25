import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import {
  PublicAccount,
  Address,
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  PlainMessage,
  Transaction,
  TransferTransaction,
  TransactionGroup,
  SignedTransaction,
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
import { format } from "date-fns";

const repo = createRepositoryFactory();

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

function formatTimestamp(timestamp: { lower: number; higher: number }): string {
  // UNIXタイムスタンプをミリ秒単位で計算
  const unixTimestamp = (timestamp.higher * 4294967296 + timestamp.lower) / 1000;

  // Dateオブジェクトを生成
  const date = new Date(unixTimestamp * 1000);

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm");
}

function Source(): JSX.Element {

  //共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  //SSS用設定
  interface SSSWindow extends Window {
    SSS: any;
    isAllowedSSS: () => boolean;
  }
  declare const window: SSSWindow;

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        const txRepo = repo.createTransactionRepository();

        const resultSearch = await firstValueFrom(
          txRepo.search({            // type: [TransactionType.AGGREGATE_BONDED],
            group: TransactionGroup.Confirmed,
            address: address,
            order: Order.Desc,
            pageSize: 100,
          })
        );
        console.log('resultSearch :', resultSearch);
        // setDataList(resultSearch.data);

        // データをグループ化し、各グループで最新のトランザクションを保持する
        const grouped: { [key: string]: Transaction } = resultSearch.data.reduce((tx, current) => {
          const address = current.signer?.address?.plain();
          if (address && ((!tx[address]) ||
            (tx[address]?.transactionInfo?.height ?? 0) < (current?.transactionInfo?.timestamp ?? 0))
          ) {
            tx[address] = current;
          }
          return tx;
        }, {} as { [key: string]: Transaction });

        const filteredDataList = Object.values(grouped);
        const sortedDataList = [...filteredDataList].sort((a, b) => {
          return Number(b.transactionInfo?.timestamp ?? 0) - Number(a.transactionInfo?.timestamp ?? 0);
        });
        setDataList(sortedDataList);

        console.log('filteredDataList ⚡️', filteredDataList);

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
    recipientRawAddress: string;
    message: string;
    xym: number;
  };

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

      <List sx={{ width: '100%', maxWidth: 1200, bgcolor: 'background.paper' }}>
        {dataList.map((data, index) => (
          <React.Fragment key={index}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar alt="Dummy" src="/" />
            </ListItemAvatar>
            <ListItemText
              primary={data?.signer?.address?.plain()}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {data && 'message' in data ? (data.message as any).payload : ''}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemText primary={data.transactionInfo?.timestamp ? formatTimestamp(data.transactionInfo.timestamp).toString() : ''} style={{ textAlign: 'right' }} />
          </ListItem>
          {index < dataList.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
        ))}
      </List>

    </>
  );
}
export default Source;
