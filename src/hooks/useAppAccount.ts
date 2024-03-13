import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  networkType,
} from '@/consts/blockchainProperty'

import {
  Account,
} from 'symbol-sdk'

const useAppAccount = (): Account|undefined => {

  const router = useRouter()

  const [appAccount, setAppAccount] = useState<Account>()
  useEffect(() => {
    const pk = localStorage.getItem('appPrivateKey')
    if (!pk || pk.length !== 64) {
      //alert('一般ユーザの秘密鍵が設定されていません')
      //router.push('/settings')
      //throw new Error('一般ユーザの秘密鍵が設定されていません')
      return
    }

    const account = Account.createFromPrivateKey(pk as string, networkType)
    setAppAccount(account)
    if (account === undefined) {
      //alert('一般ユーザの秘密鍵が不正です')
      //router.push('/settings')
      //throw new Error('一般ユーザの秘密鍵が設定されていません')
    }
  }, [])

  return appAccount
}

export default useAppAccount


