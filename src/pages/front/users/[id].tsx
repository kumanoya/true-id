import React, { useEffect, useState } from 'react';
import FrontLayout from '@/components/FrontLayout';
import styles from './id.module.css'

const messages = [
  { sender: "Alice", content: "こんにちは！", time: "10:00", isOwn: false },
  { sender: "Bob", content: "こんにちは、Alice！", time: "10:01", isOwn: true },
];

function Message(): JSX.Element {

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
