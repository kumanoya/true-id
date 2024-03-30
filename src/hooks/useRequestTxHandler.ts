import { useEffect } from 'react'
import {
  IListener,
  Transaction,
  TransferTransaction,
} from 'symbol-sdk'
import { useUserInfo } from '@/store/UserInfoContext'
import { createLoginAcceptTx } from "@/utils/createLoginAcceptTx"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
import createMessage from '@/utils/createMessage'
import createMessageTx from '@/utils/createMessageTx'
import {
  loginRequestMosaicId,
  paymentRequestMosaicId,
} from '@/consts/blockchainProperty'

export const useRequestTxHandler = () => {

  // アカウント取得
  const { account, currentUserId } = useUserInfo()

  function handleLoginRequest(tx: Transaction, userId: string)
  {
    const message = createMessage(tx as TransferTransaction)
    console.log("LOGININ REQUEST LISTENER: ACCEPTED", tx, message)
    const appId = message.signerId as string
    if (confirm(appId + "へのログインをリクエストされました。承認しますか？")) {
      const tx = createLoginAcceptTx(appId, userId)
      signAndAnnounce(tx, account)
    }
  }

  function handlePaymentRequest(tx: Transaction, userId: string)
  {
    const message = createMessage(tx as TransferTransaction)
    const appId = message.signerId as string
    if (message.content === undefined) {
      console.log("無効な支払い要求:", tx, message)
      return
    }

    const amount = parseInt(message.content)
    const jpy = amount * 4.23
    if (confirm(`${appId} への支払い\n\n ${amount} xym (約${jpy}円) \n\nをリクエストされました。支払いますか？`)) {
      const tx = createMessageTx(appId, '', amount, userId, message.id)
      signAndAnnounce(tx, account)
    }
  }

  // リスナ保持
  let listener: IListener
  useEffect(() => {
    (async() => {
      if (!account || !currentUserId) {
        return
      }

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
          // LoginRequestのトランザクションを受信
          if (tx instanceof TransferTransaction) {
            const mosaicId = tx.mosaics[0].id.toHex()
            if (mosaicId === loginRequestMosaicId) {
              handleLoginRequest(tx, currentUserId)
              return
            }
            if (mosaicId === paymentRequestMosaicId) {
              handlePaymentRequest(tx, currentUserId)
              return
            }
          }
        })
      console.log("LOGININ REQUEST LISTENER: STARTED")
    })()

    return () => {
      if (listener) {
        listener.close()
      }
    }
  },  [account])
}


