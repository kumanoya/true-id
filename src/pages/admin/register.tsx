import { firstValueFrom } from "rxjs"
import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import {
  Address,
  Transaction,
  TransactionGroup,
  TransferTransaction,
  TransactionType,
  Order,
  MosaicId,
} from 'symbol-sdk'

import {
  accountRegisterMosaicId,
} from '@/consts/blockchainProperty'

import useAdminAccount from '@/hooks/useAdminAccount';

import { Typography } from '@mui/material';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()

async function getRequestMessageTxs(address: Address): Promise<TransferTransaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      address: address, // me
      order: Order.Desc,
      transferMosaicId: new MosaicId(accountRegisterMosaicId),
      pageSize: 100,
    })
  )
  return resultSearch.data as TransferTransaction[]
}

import { createNamespaceRegistrationAndAliasTx }  from '@/utils/namespaceTxFactory';
import { signAndAnnounce } from '@/utils/signAndAnnounce';

function AdminRegister(): JSX.Element {

  // アカウント取得
  const adminAccount = useAdminAccount()

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<TransferTransaction[]>([])

  function registerAccount(parentNamespace: string, accountName: string, accountRawAddress: string)
  {
    if (!adminAccount) {
      throw new Error('adminAccount is not defined')
    }
    const aggTx = createNamespaceRegistrationAndAliasTx(adminAccount.publicAccount, parentNamespace, accountName, accountRawAddress)
    signAndAnnounce(aggTx, adminAccount)
  }

  useEffect(() => {
    if (adminAccount !== undefined) {
      (async() => {
        setDataList(await getRequestMessageTxs(adminAccount.address))
      })()
    }
  },  [adminAccount])

  return (
    <AdminLayout>
      <div className="page-title">ユーザーID申請一覧</div>
      <table className="table">
        <thead>
          <tr>
            <th>ルートネーム</th>
            <th>希望ID</th>
            <th>送信元</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data: TransferTransaction, index: number) => {
            if (!data.message) {
              return (<tr key={index}><td colSpan={3}>エラー</td></tr>)
            }
            const [rootName, accountName] = data.message.payload.split(':')
            const rawAddress = data.signer?.address?.pretty()
            if (!rawAddress) {
              return (<tr key={index}><td colSpan={3}>エラー</td></tr>)
            }
            return (
              <tr key={index}>
                <td>{ rootName }</td>
                <td>{ accountName }</td>
                <td className="text-sm">{ rawAddress }</td>
                <td className="p-0 w-32 text-center">
                  <button className="btn" onClick={() => registerAccount(rootName, accountName, rawAddress)}>承認</button>
                </td>
              </tr>
              )
          }
          )}
        </tbody>
      </table>

    </AdminLayout>
  )
}
export default AdminRegister


