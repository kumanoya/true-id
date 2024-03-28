import React, { useEffect, useState } from 'react';
import FrontLayout from '@/components/FrontLayout';
import styles from './address.module.css'
import { useRouter } from 'next/router'
import { useUserInfo } from '@/store/UserInfoContext'
import userMessages from '@/utils/userMessages'
import Message from '@/types/message'
import {
  Address,
} from 'symbol-sdk'
import { formatUnixTime } from '@/utils/formatUnixTime'

function Message(): JSX.Element {

  const [messages, setMessages] = useState<Message[]>([])
  const { account, currentUserId } = useUserInfo()

  const handleSubmit = () => {
    console.log('メッセージを送信する')
  };

  const router = useRouter()

  useEffect(() => {
    console.log('USE EFFECT')
    if (!account || !account.address || !currentUserId)
    {
      console.log('Account not found')
      console.log(account)
      console.log(currentUserId)
      return
    }

    // 差出人address取得
    const { address } = router.query
    if (!address || (typeof address !== 'string')) {
      console.log('Address not found')
      console.log(router.query)
      return
    }
    const signerAddress = Address.createFromRawAddress(address)

    console.log('FETCH');

    (async () => {
      const msgs = await userMessages(signerAddress, account.address, currentUserId)
      console.log(msgs)
      setMessages(msgs)
    })()

  }, [account, currentUserId, router.query])

  return (
    <FrontLayout>
      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.message} ${message.signerId === currentUserId ? styles.own : ''}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>{message.signerId}</span>
                <span className={styles.messageTime}>{formatUnixTime(message.timestamp)}</span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className={styles.chatInput}>
          <input
            type="text"
            value=""
            onChange={(e) => {}}
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
