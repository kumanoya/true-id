import { firstValueFrom } from "rxjs"
import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import {
  Address,
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
      const confirmedTx = await listener.confirmed(account.address).toPromise()
      console.log("LISTENER: TRANSACTION CONFIRMED")
      //console.dir({ confirmedTx }, { depth: null })
      setMessages(current => [createMessage(confirmedTx as TransferTransaction), ...current])
      console.log("LISTENER: STARTED")
    })()
  },  [account])

  return (
    <FrontLayout>
      <table className="table">
        <thead>
          <tr>
            <th>ログインリクエスト</th>
            <th>送信元</th>
            <th>RAW</th>
            <th>日時</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((data, index) => (
            <tr key={index}>
              <td className="px-2">{ data.content }</td>
              <td className="px-2">{ data.signerId }</td>
              <td className="px-2">{ data.rawMessage }</td>
              <td className="px-2">{ formatUnixTime(data.timestamp) }</td>
              <td className="px-2">
                <button className="btn" onClick={() => { loginAccept(data.signerId) }}>承認</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </FrontLayout>
  )
}
export default Request

