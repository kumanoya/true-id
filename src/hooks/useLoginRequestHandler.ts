import { useEffect } from 'react'
import {
  IListener,
  TransferTransaction,
} from 'symbol-sdk'
import { useUserInfo } from '@/store/UserInfoContext'
import { createLoginAcceptTx } from "@/utils/createLoginAcceptTx"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
import createMessage from '@/utils/createMessage'
import { loginRequestMosaicId } from '@/consts/blockchainProperty'

export const useLoginRequestHandler = () => {

  // アカウント取得
  const { account, currentUserId } = useUserInfo()

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
          if (tx instanceof TransferTransaction && tx.mosaics[0].id.toHex() === loginRequestMosaicId) {
            const message = createMessage(tx as TransferTransaction)
            console.log("LOGININ REQUEST LISTENER: ACCEPTED", tx, message)

            const appId = message.signerId as string
            if (confirm(appId + "へのログインをリクエストされました。承認しますか？")) {
              const tx = createLoginAcceptTx(appId, currentUserId)
              signAndAnnounce(tx, account)
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


