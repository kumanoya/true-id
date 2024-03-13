import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  networkType,
} from '@/consts/blockchainProperty'

import {
  Account,
} from 'symbol-sdk'

const useAdminAccount = (): Account|undefined => {

  const router = useRouter()

  const [adminAccount, setAdminAccount] = useState<Account>()
  useEffect(() => {
    const pk = localStorage.getItem('adminPrivateKey')
    if (!pk || pk.length !== 64) {
      alert('管理者秘密鍵が設定されていません')
      router.push('/settings')
      throw new Error('管理者秘密鍵が設定されていません')
    }

    const account = Account.createFromPrivateKey(pk as string, networkType)
    setAdminAccount(account)
    if (account === undefined) {
      alert('管理者秘密鍵が不正です')
      router.push('/settings')
      throw new Error('管理者秘密鍵が設定されていません')
    }
  }, [])

  return adminAccount
}

export default useAdminAccount


