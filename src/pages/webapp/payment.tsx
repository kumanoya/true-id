'use client'

import WebappLayout from '@/components/WebappLayout'
import useAppAccount from '@/hooks/useAppAccount'
import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createLoginRequestTx } from '@/utils/createLoginRequestTx'
import { unformatId } from '@/utils/formatId'
import { useState, useEffect } from 'react'
import createMessage from '@/utils/createMessage'
import {
  TransferTransaction,
  Transaction,
  IListener,
} from 'symbol-sdk'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
import { loginAcceptMosaicId } from '@/consts/blockchainProperty'
import { formatId } from '@/utils/formatId'
const repo = createRepositoryFactory()

function Payment(): JSX.Element {

  // アカウント取得
  const { appId, appAccount } = useAppAccount()
  type Inputs = {
    userId: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // login中かを表すstate
  interface LoginState {
    isLoggingIn: boolean,
    userId: string|null,
    isAccepted: boolean,
  }
  const [loginState, setLoginState] = useState<LoginState>()
  useEffect(() => {
    // ローカルストレージから復元
    const localState: string|null = localStorage.getItem('loginState')
    if (localState === null) {
      // 初期化
      setLoginState({
        isLoggingIn: false,
        userId: null,
        isAccepted: false,
      })
    } else {
      const parsed = JSON.parse(localState)
      if (parsed) {
        setLoginState(parsed)
      } else {
        throw new Error('localState is invalid: ' + localState)
      }
    }
  }, [])

  // localStateの変更をローカルストレージに保存するフック
  useEffect(() => {
    if (loginState) {
      localStorage.setItem('loginState', JSON.stringify(loginState))
    }
  }, [loginState])

  // SUBMIT LOGIC
  const login: SubmitHandler<Inputs> = (data) => {
    if (appAccount === undefined) {
      throw new Error('appAccount is not defined')
    }

    const realId = unformatId(data.userId)

    // ログインリクエストを送信
    createLoginRequestTx(realId, appId)
      .then(tx => signAndAnnounce(tx, appAccount))

    // ログイン中の状態に遷移
    setLoginState({
      isLoggingIn: true,
      userId: realId,
      isAccepted: false,
    })
  }

  function logout()
  {
    setLoginState({
      isLoggingIn: false,
      userId: null,
      isAccepted: false,
    })
  }

  // ログインリクエストの承認を監視
  let listener: IListener
  useEffect(() => {
    if (!appAccount || !loginState) {
      return
    }
    if (loginState.isLoggingIn) {
      (async() => {
        // リスナの二重登録を防ぐ
        if (listener === undefined) {
          listener = repo.createListener()

          await listener.open()
          // 未承認のトランザクションを監視
          listener.confirmed(appAccount.address)
            .subscribe(tx => {

              // LoginAcceptのトランザクションを受信
              if (tx instanceof TransferTransaction && tx.mosaics[0].id.toHex() === loginAcceptMosaicId) {
                if (!loginState.userId) {
                  throw new Error('ログインリクエストが失効しています')
                }

                const message = createMessage(tx as TransferTransaction)
                console.log("LISTENER: CATCH", tx, message)
                if (message.content === loginState.userId) {
                  alert('ログインしました！')
                  setLoginState({
                    isLoggingIn: false,
                    userId: loginState.userId,
                    isAccepted: true,
                  })
                }
              }
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
  },  [loginState, appAccount])

  return (
    <WebappLayout>
      <div className="page-title">外部アプリでTrueIDで支払い</div>
      { !loginState || appAccount === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          { loginState.isLoggingIn?
              <div className="info">
                <div>{formatId(loginState.userId)} でログイン試行中です。<br/>TrueIdアプリで承認して下さい。</div>
                <div className="pt-6 text-center">
                  <button className="btn-clear" onClick={logout}>キャンセル</button>
                </div>
              </div>
            :
            loginState.isAccepted?
              <div className="info">
                <div>{formatId(loginState.userId)} でログイン中です</div>
                <div className="pt-6 text-center">
                  <button className="btn-clear" onClick={logout}>ログアウト</button>
                </div>
              </div>
              :
              <form onSubmit={handleSubmit(login)} className="form">
                <div className="flex flex-col">
                  <label>
                    TrueIDでログイン
                  </label>
                  <input
                    {...register("userId", { required: "アカウント名を入力してください" })}
                    className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                    type="text"
                    name="userId"
                    placeholder="hogehoge@true-id"
                    required
                  />
                </div>

                <div className="text-center">
                  <button className="btn">ログイン</button>
                </div>
              </form>
          }
        </div>
      )}
    </WebappLayout>
  )
}
export default Payment

