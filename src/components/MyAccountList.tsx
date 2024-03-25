import React, { useEffect, useState } from 'react';
import { Drawer } from '@mui/material';
import {
  Account,
} from 'symbol-sdk';

import { useUserInfo } from '@/store/UserInfoContext'

function MyAccountList(props: {
  account: Account | null | undefined,
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {

  const { account, isOpen, setIsOpen } = props
  const { currentUserId, userIds, setCurrentUserId } = useUserInfo()

  function changeId(id: string): void {
    setIsOpen(false)
    setCurrentUserId(id)
    alert('IDを変更しました: ' + id)
  }

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
              {userIds.map((id: string) => (
                <li key={id}>
                  <a className="" onClick={() => changeId(id)}>
                    { id }
                  </a>
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

