import React, { useEffect, useState } from 'react';
import { Box, Typography, Drawer } from '@mui/material';
import {
  NamespaceName,
  Account,
} from 'symbol-sdk';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

function MyAccountList(props: {
  account: Account | null | undefined,
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {

  const { account, isOpen, setIsOpen } = props

  const [accountNames, setAccountNames] = useState<string[]>([]);

  useEffect(() => {
    if (account) {
      (async() => {
        repo.createNamespaceRepository().getAccountsNames([account.address]).subscribe((names) => {
          console.log("NAMES[]: ", names)
          const accountNames = names[0].names.map((namespaceName: NamespaceName) => namespaceName.name).sort()
          setAccountNames(accountNames)
        })
      })();
    }
  },  [account]);

  return (
    <Drawer anchor={'top'} open={isOpen} onClose={() => setIsOpen(false)}>
      {account === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="my-account">
          <div className="p-4 text-right bg-gray-100">
            Symbolアドレス: { account?.address.plain() }
          </div>
          <div className="p-2">取得済みアカウントID一覧</div>
          <div className="account-list-wrap">
            <ul className="account-list mx-4">
              {accountNames.map((name) => (
                <li key={name}>
                  { name }
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </Drawer>
  );
}
export default MyAccountList;

