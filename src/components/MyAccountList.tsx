import React, { useEffect, useState } from 'react';
import { Drawer } from '@mui/material';
import {
  Account,
} from 'symbol-sdk';
import { useUserInfo } from '@/store/UserInfoContext'
import { formatId } from '@/utils/formatId'

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
    //alert('IDを変更しました: ' + id)
  }

  return (
    <Drawer anchor={'right'} open={isOpen} onClose={() => setIsOpen(false)}>
      {account === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="my-account">
          <div className="p-4 bg-gray-100 text-gray-600">
            <div className="text-sm">Symbolアドレス:</div>
            <div className="text-sm">{ account?.address.plain() }</div>
          </div>
          <div className="py-2 px-4">ID切替</div>
          <div className="">
            {userIds.map((id: string) => (
              <a key={id} className="block mx-4 pb-2 cursor-pointer" onClick={() => changeId(id)}>
                { formatId(id) }
              </a>
            ))}
          </div>
        </div>
      )}

    </Drawer>
  );
}
export default MyAccountList;

