import React, { useEffect, useState } from 'react';
import FrontLayout from '@/components/FrontLayout';
import styles from './userId.module.css'
import { useRouter } from 'next/router'
import { useUserInfo } from '@/store/UserInfoContext'
import userMessages from '@/utils/userMessages'
import Message from '@/types/message'
import UserMessageForm from '@/components/UserMessageForm'
import { formatUnixTime } from '@/utils/formatUnixTime'
import { formatId } from '@/utils/formatId'
import {
  IListener,
  TransferTransaction,
} from 'symbol-sdk'
import createMessage from '@/utils/createMessage'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()

function Message(): JSX.Element {

  const [messages, setMessages] = useState<Message[]>([])
  const { account, currentUserId } = useUserInfo()

  const router = useRouter()
  const userId = router.query.userId as string

  useEffect(() => {
    if (!account || !account.address || !currentUserId)
    {
      return
    }

    // 差出人userId取得
    if (!userId || (typeof userId !== 'string')) {
      return
    }

    (async () => {
      const msgs = await userMessages(userId, account.address, currentUserId)
      console.log(msgs)
      setMessages(msgs)
    })()

  }, [account, currentUserId, router.query])

  // リスナ保持
  let listener: IListener

  useEffect(() => {
    if (!account)
    {
      return
    }

    (async() => {
      // リスナの二重登録を防ぐ
      if (listener !== undefined) {
        return
      }
      listener = repo.createListener()

      await listener.open()
      // 未承認のトランザクションを監視
      listener.confirmed(account.address)
        .subscribe(tx => {
          console.log("LISTENER: CATCHED")
          if (tx instanceof TransferTransaction) {
            const message = createMessage(tx as TransferTransaction)
            console.log("LISTENER: ACCEPTED", tx, message)
            // XXX: Listenした場合、timestampは正しく取得できないようなので無理やり再設定する
            // unixtimestampを取得
            message.timestamp = Date.now()/1000
            setMessages(current => [...current, message])
          }
        })
      console.log("LISTENER: STARTED")
    })()

    return () => {
      if (listener) {
        listener.close()
      }
    }
  },  [account])

  return (
    userId?
    <FrontLayout>
      <div className="text-2xl font-bold mb-4 text-center bg-gray-800 text-white p-2 rounded">{ formatId(userId) }さんとの会話</div>
      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.message} ${message.signerId === currentUserId ? styles.own : ''}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>{ formatId(message.signerId) }</span>
                <span className={styles.messageTime}>{formatUnixTime(message.timestamp)}</span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
            </div>
          ))}
        </div>
      </div>
      <UserMessageForm recipientId={userId} />
    </FrontLayout>
    :
    <FrontLayout>
      <div className="info">IDが未設定です</div>
    </FrontLayout>
  );
}
export default Message;
