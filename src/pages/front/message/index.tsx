import React, { useEffect, useState } from 'react';
import FrontLayout from '@/components/FrontLayout';
import styles from './message.module.css'
import {
  Transaction,
  TransactionGroup,
  Order,
} from 'symbol-sdk';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { format } from "date-fns";

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

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {

      })();
    }
  },  [address, sssState]);

  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log('メッセージを送信する')
  };

  return (
    <FrontLayout>
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

    </FrontLayout>
  );
}
export default Message;
