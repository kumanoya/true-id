// UserInfoContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'
import useUserAccount from '@/hooks/useUserAccount'
import { Account, NamespaceName } from 'symbol-sdk'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'

const repo = createRepositoryFactory()

const UserInfoContext = createContext(null)

interface UserInfo {
  userIds: string[],
  currentUserId: string|null,
  account: Account|null|undefined,
  setCurrentUserId: (userId: string) => void,
}

export const UserInfoProvider = ({ children }) => {
  const account = useUserAccount()
  const [userIds, setUserIds] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string|null>(null)

  useEffect(() => {
    if (account) {
      (async () => {
        repo.createNamespaceRepository().getAccountsNames([account.address]).subscribe((names) => {
          const ids = names[0].names.map((namespaceName: NamespaceName) => namespaceName.name).sort()
          setUserIds(ids)
        })
      })()
    }
  }, [account])

  useEffect(() => {
    const storedCurrentUserId = localStorage.getItem('currentUserId')
    if (storedCurrentUserId) {
      setCurrentUserId(storedCurrentUserId)
    }
  }, [])

  useEffect(() => {
    if (currentUserId === null) {
      localStorage.removeItem('currentUserId')
    } else {
      localStorage.setItem('currentUserId', currentUserId)
    }
  }, [currentUserId])

  const value: UserInfo = { userIds, currentUserId, setCurrentUserId, account }

  return <UserInfoContext.Provider value={value}>{children}</UserInfoContext.Provider>
}

export const useUserInfo = () => useContext(UserInfoContext)

