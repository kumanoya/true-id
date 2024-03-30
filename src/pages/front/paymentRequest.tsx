import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import {
  IListener,
  TransferTransaction,
} from 'symbol-sdk'
import { useUserInfo } from '@/store/UserInfoContext'
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
import Message from '@/types/message'
import paymentRequestMessages from '@/utils/paymentRequestMessages'
import getSentMessages from '@/utils/getSentMessages'
import createMessage from '@/utils/createMessage'
import { formatUnixTime } from '@/utils/formatUnixTime'
import { paymentRequestMosaicId } from '@/consts/blockchainProperty'
import createMessageTx from '@/utils/createMessageTx'

function PaymentRequest(): JSX.Element {

  function handlePaymentRequest(message: Message, userId: string)
  {
    const appId = message.signerId as string
    if (message.content === undefined) {
      console.log("無効な支払い要求:", message)
      return
    }

    const amount = parseInt(message.content)
    const jpy = amount * 4.23
    if (confirm(`${appId} への支払い\n\n ${amount} xym (約${jpy}円) \n\nをリクエストされました。支払いますか？`)) {
      const tx = createMessageTx(appId, '', amount, userId, message.id)
      console.log("PAYMENT: ", tx)
      signAndAnnounce(tx, account)
    }
  }

  // アカウント取得
  const { account, currentUserId } = useUserInfo()

  // メッセージ一覧表示用
  const [requestMessages, setRequestMessages] = useState<Message[]>([])

  // 処理済み判定用
  const [repliedIds, setRepliedIds] = useState<string[]>([])

  // リスナ保持
  let listener: IListener

  useEffect(() => {
    (async() => {
      if (!account || !currentUserId) {
        return
      }
      setRequestMessages(await paymentRequestMessages(currentUserId, account.address))
      const sentMessages = await getSentMessages(account.publicKey, currentUserId)
      setRepliedIds(
        sentMessages
          .filter(message => message.replyToId !== null)
          .map(message => message.replyToId as string)
      )

      // リスナの二重登録を防ぐ
      if (listener !== undefined) {
        return
      }
      // Start monitoring of transaction status with websocket
      listener = repo.createListener()
      //setListener(listener)

      await listener.open()
      // 未承認のトランザクションを監視
      listener.confirmed(account.address)
        .subscribe(tx => {
          console.log("LISTENER: CATCHED")
          // PaymentRequestのトランザクションを受信
          if (tx instanceof TransferTransaction && tx.mosaics[0].id.toHex() === paymentRequestMosaicId) {
            const message = createMessage(tx as TransferTransaction)
            console.log("LISTENER: ACCEPTED", tx, message)
            // XXX: Listenした場合、timestampは正しく取得できないようなので無理やり再設定する
            // unixtimestampを取得
            message.timestamp = Date.now()/1000
            setRequestMessages(current => [message, ...current])
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
    <FrontLayout>
      <div className="page-title">支払いリクエスト一覧</div>
      <table className="table">
        <thead>
          <tr>
            <th>アプリ</th>
            {/*
            <th>送信元</th>
            <th>RAW</th>
            */}
            <th>日時</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {requestMessages.map((message, index) => (
            <tr key={index}>
              <td>{ message.signerId }</td>
              {/*
              <td>{ message.content }</td>
              <td>{ message.rawMessage }</td>
              */}
              <td>{ formatUnixTime(message.timestamp) }</td>
              <td className="px-0 w-32 text-center">
                {(repliedIds.includes(message.id as string))?
                <span>処理済み</span>
                :
                <button className="btn" onClick={() => { handlePaymentRequest(message, currentUserId as string) }}>承認</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </FrontLayout>
  )
}
export default PaymentRequest

