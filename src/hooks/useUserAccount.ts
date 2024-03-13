import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  networkType,
} from '@/consts/blockchainProperty'

import {
  Account,
} from 'symbol-sdk'

const useUserAccount = (): Account|undefined => {

  const router = useRouter()

  const [userAccount, setUserAccount] = useState<Account>()
  useEffect(() => {
    const pk = localStorage.getItem('userPrivateKey')
    if (!pk || pk.length !== 64) {
      //alert('一般ユーザの秘密鍵が設定されていません')
      //router.push('/settings')
      //throw new Error('一般ユーザの秘密鍵が設定されていません')
      return
    }

    const account = Account.createFromPrivateKey(pk as string, networkType)
    setUserAccount(account)
    if (account === undefined) {
      //alert('一般ユーザの秘密鍵が不正です')
      //router.push('/settings')
      //throw new Error('一般ユーザの秘密鍵が設定されていません')
    }
  }, [])

  return userAccount
}

export default useUserAccount


