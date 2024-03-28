import { firstValueFrom } from "rxjs"
import {
  TransactionType,
  TransferTransaction,
  TransactionGroup,
  Order,
  Address,
} from 'symbol-sdk'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
import Message from '@/types/message'
import createMessage from '@/utils/createMessage'

//==============================================================================
// latestMessages
//==============================================================================
const latestMessages = async (address: Address, currentUserId: string|null = null) => {
  const txRepo = repo.createTransactionRepository()

  const resultSearch = await firstValueFrom(
    txRepo.search({            // type: [TransactionType.AGGREGATE_BONDED],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      type: [TransactionType.TRANSFER],
      pageSize: 100,
    })
  )

  const messages = resultSearch.data
    .map(tx => createMessage(tx as TransferTransaction))
    .filter(msg => msg.recipientId === currentUserId)

  // データをグループ化し、各グループで最新のトランザクションを保持する
  const grouped: { [key: string]: Message } = messages.reduce((calc, current) => {
    const signerAddress = current.signerAddress
    if (signerAddress && ((!calc[signerAddress]) ||
      (calc[signerAddress].timestamp?? 0) < (current.timestamp ?? 0)
    )) {
      calc[signerAddress] = current
    }
    return calc
  }, {} as { [key: string]: Message })

  const filteredDataList = Object.values(grouped)
  console.log('filteredDataList ⚡️', filteredDataList)

  const sortedDataList = [...filteredDataList].sort((a, b) => {
    return Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)
  })
  return sortedDataList
}

export default latestMessages



