import { firstValueFrom } from "rxjs"
import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import {
  Address,
  IListener,
  Transaction,
  TransactionGroup,
  TransactionType,
  TransferTransaction,
  Order,
  MosaicId,
} from 'symbol-sdk'
import {
  loginRequestMosaicId,
} from '@/consts/blockchainProperty'
import { useUserInfo } from '@/store/UserInfoContext'
import { createLoginAcceptTx } from "@/utils/createLoginAcceptTx"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()

async function getLoginRequestMessageTxs(currentUserId: string, address: Address): Promise<TransferTransaction[]>
{
  const resultSearch = await txRepo.search({
    type: [TransactionType.TRANSFER],
    group: TransactionGroup.Confirmed,
    recipientAddress: address, // me
    order: Order.Desc,
    transferMosaicId: new MosaicId(loginRequestMosaicId),
    pageSize: 100,
  }).toPromise()

  if (resultSearch === undefined) {
    return []
  }

  const txs = resultSearch.data as TransferTransaction[]
  //console.log("getLoginRequestMessageTxs", txs)
  const filtered = txs.filter(tx => tx.message?.payload === currentUserId)
  //console.log("Filtered", filtered)
  return filtered
}

function Request(): JSX.Element {

  function loginAccept(recipientAddress: Address|undefined)
  {
    if (recipientAddress === undefined) {
      throw new Error('address is not defined')
    }
    if (currentUserId === null) {
      throw new Error('currentUserId is not defined')
    }
    const tx = createLoginAcceptTx(recipientAddress, currentUserId)
    signAndAnnounce(tx, account)
  }

  // アカウント取得
  const { account, currentUserId } = useUserInfo()

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<TransferTransaction[]>([])

  // リスナ保持
  let listener: IListener

  useEffect(() => {
    (async() => {
      if (!account || !currentUserId) {
        return
      }
      setDataList(await getLoginRequestMessageTxs(currentUserId, account.address))

      // リスナの二重登録を防ぐ
      if (listener !== undefined) {
        return
      }
      // Start monitoring of transaction status with websocket
      listener = repo.createListener()
      //setListener(listener)

      await listener.open()
      const confirmedTx = await listener.confirmed(account.address).toPromise()
      console.log("LISTENER: TRANSACTION CONFIRMED")
      //console.dir({ confirmedTx }, { depth: null })
      setDataList(current => [confirmedTx as TransferTransaction, ...current])
      console.log("LISTENER: STARTED")
    })()
  },  [account])

  return (
    <FrontLayout>
      <table className="table">
        <thead>
          <tr>
            <th>ログインリクエスト</th>
            <th>送信元</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td className="px-2">{ data?.message?.payload }</td>
              <td className="px-2">{ data.signer?.address?.plain() }</td>
              <td className="px-2">
                <button className="btn" onClick={() => { loginAccept(data.signer?.address) }}>承認</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </FrontLayout>
  )
}
export default Request

