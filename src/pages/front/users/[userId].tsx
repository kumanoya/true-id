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

function Message(): JSX.Element {

  const [messages, setMessages] = useState<Message[]>([])
  const { account, currentUserId } = useUserInfo()

  const router = useRouter()
  const { userId } = router.query

  useEffect(() => {
    if (!account || !account.address || !currentUserId)
    {
      console.log('Account not found')
      console.log(account)
      console.log(currentUserId)
      return
    }

    // 差出人userId取得
    if (!userId || (typeof userId !== 'string')) {
      console.log('userId not found')
      console.log(router.query)
      return
    }

    (async () => {
      const msgs = await userMessages(userId, account.address, currentUserId)
      console.log(msgs)
      setMessages(msgs)
    })()

  }, [account, currentUserId, router.query])

  return (
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
        <UserMessageForm recipientId={userId} />
      </div>

    </FrontLayout>
  );
}
export default Message;
