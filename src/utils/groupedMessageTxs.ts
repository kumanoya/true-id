import { firstValueFrom } from "rxjs"
import {
  Transaction,
  TransactionGroup,
  Order,
  Address,
} from 'symbol-sdk'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()

//==============================================================================
// groupedMessageTxs
//==============================================================================
const groupedMessageTxs = async (address: Address) => {
  const txRepo = repo.createTransactionRepository()

  const resultSearch = await firstValueFrom(
    txRepo.search({            // type: [TransactionType.AGGREGATE_BONDED],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  )
  console.log('resultSearch :', resultSearch)
  // setDataList(resultSearch.data)

  // データをグループ化し、各グループで最新のトランザクションを保持する
  const grouped: { [key: string]: Transaction } = resultSearch.data.reduce((tx, current) => {
    const address = current.signer?.address?.plain()
    if (address && ((!tx[address]) ||
      (tx[address]?.transactionInfo?.height ?? 0) < (current?.transactionInfo?.timestamp ?? 0))
    ) {
      tx[address] = current
    }
    return tx
  }, {} as { [key: string]: Transaction })

  const filteredDataList = Object.values(grouped)
  console.log('filteredDataList ⚡️', filteredDataList)

  const sortedDataList = [...filteredDataList].sort((a, b) => {
    return Number(b.transactionInfo?.timestamp ?? 0) - Number(a.transactionInfo?.timestamp ?? 0)
  })
  return sortedDataList
}

export default groupedMessageTxs


