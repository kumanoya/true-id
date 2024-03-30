import { useState, useEffect } from 'react'
import {
  networkType,
} from '@/consts/blockchainProperty'

import {
  Account,
} from 'symbol-sdk'

const useAppAccount = (): { appAccount: Account|undefined, appId: string } => {

  // XXX: IDハードコード
  const appId = 'true-id-app-test'

  const [appAccount, setAppAccount] = useState<Account>()
  useEffect(() => {
    //const pk = localStorage.getItem('appPrivateKey')
    // XXX: 秘密鍵ハードコード
    const pk = 'FF48B10FA78CD6CCE3A01F99540F22231B6C0609B8F366E95242436C2B11AA63'
    if (!pk || pk.length !== 64) {
      //alert('一般ユーザの秘密鍵が設定されていません')
      //router.push('/settings')
      //throw new Error('一般ユーザの秘密鍵が設定されていません')
      return
    }

    const account = Account.createFromPrivateKey(pk as string, networkType)
    if (account === undefined) {
      //alert('ウェブアプリの秘密鍵が不正です')
      throw new Error('ウェブアプリの秘密鍵が不正です')
    }
    setAppAccount(account)
  }, [])

  return { appAccount, appId }
}

export default useAppAccount


