import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import {
  IListener,
  TransferTransaction,
} from 'symbol-sdk'
import { useUserInfo } from '@/store/UserInfoContext'
import { createLoginAcceptTx } from "@/utils/createLoginAcceptTx"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
import Message from '@/types/message'
import loginRequestMessages from '@/utils/loginRequestMessages'
import createMessage from '@/utils/createMessage'
import { formatUnixTime } from '@/utils/formatUnixTime'
import { loginRequestMosaicId } from '@/consts/blockchainProperty'

function Request(): JSX.Element {

  function loginAccept(appId: string|undefined)
  {
    if (appId === undefined) {
      throw new Error('address is not defined')
    }
    if (currentUserId === null) {
      throw new Error('currentUserId is not defined')
    }
    const tx = createLoginAcceptTx(appId, currentUserId)
    signAndAnnounce(tx, account)
  }

  // アカウント取得
  const { account, currentUserId } = useUserInfo()

  // メッセージ一覧表示用
  const [messages, setMessages] = useState<Message[]>([])

  // リスナ保持
  let listener: IListener

  useEffect(() => {
    (async() => {
      if (!account || !currentUserId) {
        return
      }
      setMessages(await loginRequestMessages(currentUserId, account.address))

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
          // LoginRequestのトランザクションを受信
          if (tx instanceof TransferTransaction && tx.mosaics[0].id.toHex() === loginRequestMosaicId) {
            const message = createMessage(tx as TransferTransaction)
            console.log("LISTENER: ACCEPTED", tx, message)
            // XXX: Listenした場合、timestampは正しく取得できないようなので無理やり再設定する
            // unixtimestampを取得
            message.timestamp = Date.now()/1000
            setMessages(current => [message, ...current])
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
      <div className="page-title">ログインリクエスト一覧</div>
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
          {messages.map((message, index) => (
            <tr key={index}>
              <td>{ message.signerId }</td>
              {/*
              <td>{ message.content }</td>
              <td>{ message.rawMessage }</td>
              */}
              <td>{ formatUnixTime(message.timestamp) }</td>
              <td className="px-0 w-32 text-center">
                <button className="btn" onClick={() => { loginAccept(message.signerId) }}>承認</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </FrontLayout>
  )
}
export default Request

