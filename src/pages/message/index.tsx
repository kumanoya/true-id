import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import styles from './message.module.css'
import {
  Transaction,
  TransactionGroup,
  Order,
  Address,
  TransactionType,
} from 'symbol-sdk';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
import { format } from "date-fns";

const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

const messages = [
  { sender: "Alice", content: "こんにちは！", time: "10:00", isOwn: false },
  { sender: "Bob", content: "こんにちは、Alice！", time: "10:01", isOwn: true },
];

function formatTimestamp(timestamp: { lower: number; higher: number }): string {
  // UNIXタイムスタンプをミリ秒単位で計算
  const unixTimestamp = (timestamp.higher * 4294967296 + timestamp.lower) / 1000;

  // Dateオブジェクトを生成
  const date = new Date(unixTimestamp * 1000);

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm");
}

function Message(): JSX.Element {

  //共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        const txRepo = repo.createTransactionRepository();

        const resultSearch = await firstValueFrom(
          txRepo.search({           // type: [TransactionType.AGGREGATE_BONDED],
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

  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log('メッセージを送信する')
  };

  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />

      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.message} ${message.isOwn ? styles.own : ''}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>{message.sender}</span>
                <span className={styles.messageTime}>{message.time}</span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className={styles.chatInput}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力"
            className={styles.messageInput}
          />
          <button type="submit" className={styles.sendButton}>送信</button>
        </form>
      </div>

    </>
  );
}
export default Message;