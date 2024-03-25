import { useState, useEffect } from 'react'
import useUserAccount from '@/hooks/useUserAccount';
import {
  NamespaceName,
} from 'symbol-sdk';
import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();


// ログイン中のユーザーのID一覧を取得する
const useUserIds = (): string[] => {
  const userAccount = useUserAccount();

  const [userIds, setUserIds] = useState<string[]>([]);
  useEffect(() => {
    if (userAccount) {
      (async() => {
        repo.createNamespaceRepository().getAccountsNames([userAccount.address]).subscribe((names) => {
          console.log("NAMES[]: ", names)
          const ids = names[0].names.map((namespaceName: NamespaceName) => namespaceName.name).sort()
          setUserIds(ids)
        })
      })();
    }
  },  [userAccount]);

  return userIds
}

export default useUserIds


