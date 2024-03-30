import { firstValueFrom } from "rxjs"
import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import MessageForm from '@/components/MessageForm'
import { Typography } from '@mui/material'
import {
  Address,
  IListener,
  Transaction,
  TransactionGroup,
  TransactionType,
  Order,
  TransferTransaction,
} from 'symbol-sdk'

//import useUserAccount from '@/hooks/useUserAccount'
import { useUserInfo } from '@/store/UserInfoContext'

import Message from '@/types/message'
import createMessage from '@/utils/createMessage'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()

async function getMessageTxs(address: Address): Promise<TransferTransaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  )
  console.log('resultSearch :', resultSearch)
  return resultSearch.data as TransferTransaction[]
}

function isJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch (error) {
    return false
  }
}

function Home(): JSX.Element {

  // アカウント取得
  //const account = useUserAccount()
  const { account, currentUserId } = useUserInfo()

  // メッセージ一覧表示用
  const [messages, setMessages] = useState<Message[]>([])

  // リスナ保持
  let listener: IListener

  useEffect(() => {
    if (account && currentUserId !== undefined) {
      (async() => {
        // トランザクション全取得
        const txs = await getMessageTxs(account.address)
        //console.log(txs[0])

        // メッセージに変換
        const allMessages = txs.map(tx => createMessage(tx))

        // 現在のID宛のメッセージのみ抽出
        const filtered = allMessages.filter(message => message.recipientId === currentUserId)
        setMessages(filtered)

        // リスナの二重登録を防ぐ
        if (listener === undefined) {
          // Start monitoring of transaction status with websocket
          listener = repo.createListener()
          //setListener(listener)

          await listener.open()
          listener
            .confirmed(account.address)
            .subscribe((confirmedTx: Transaction) => {
              console.log("LISTENER: TRANSACTION CONFIRMED")
              //console.dir({ confirmedTx }, { depth: null })
              setMessages(current => [createMessage(confirmedTx as TransferTransaction), ...current])
            })
          }
          console.log("LISTENER: STARTED")
      })()
    }

    return () => {
      if (listener) {
        listener.close()
      }
    }
  },  [account])

  return (
    <FrontLayout>
      <MessageForm />
      <Typography component='div' variant='h6' mt={5} mb={1}>
        メッセージ一覧
      </Typography>
      <table className="table">
        <thead>
          <tr>
            <th>メッセージ</th>
            <th>宛先</th>
            <th>送信元ID</th>
            <th>送信元アドレス</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message, index) => (
            <tr key={index}>
              <td>{ message.content }</td>
              <td>{ message.recipientId }</td>
              <td>{ message.signerId }</td>
              <td>{ message.signerAddress }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </FrontLayout>
  )
}
export default Home
