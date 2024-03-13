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

async function getRequestMessageTxs(address: Address): Promise<Transaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      recipientAddress: address, // me
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
  const [dataList, setDataList] = useState<Transaction[]>([])

  function registerAccount(parentNamespace: string, accountName: string, accountRawAddress: string)
  {
    if (!adminAccount) {
      throw new Error('adminAccount is not defined')
    }
    const aggTx = createNamespaceRegistrationAndAliasTx(adminAccount.publicAccount, parentNamespace, accountName, accountRawAddress);
    signAndAnnounce(aggTx);
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
      <Typography component='div' variant='h6' mt={5} mb={1}>
        アカウント登録リクエスト一覧
      </Typography>
      <table className="table">
        <thead>
          <tr>
            <th>ルートネームスペース</th>
            <th>希望アカウントID</th>
            <th>送信元</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data: TransferTransaction, index: number) => {
            if (!data.message) {
              return (<tr><td colSpan={3}>エラー</td></tr>)
            }
            const [rootName, accountName] = data.message.payload.split(':')
            const rawAddress = data.signer?.address?.plain()
            if (!rawAddress) {
              return (<tr><td colSpan={3}>エラー</td></tr>)
            }
            return (
              <tr key={index}>
                <td className="px-2">{ rootName }</td>
                <td className="px-2">{ accountName }</td>
                <td className="px-2">{ rawAddress }</td>
                <td className="px-2">
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


