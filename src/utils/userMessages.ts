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
// userMessages
//==============================================================================
const userMessages = async (
  signerAddress: Address,
  recipientAddress: Address,
  currentUserId: string|null = null
): Promise<Message[]> => {
  const txRepo = repo.createTransactionRepository()

  const resultSearch = await firstValueFrom(
    txRepo.search({            // type: [TransactionType.AGGREGATE_BONDED],
      group: TransactionGroup.Confirmed,
      address: recipientAddress,
      order: Order.Desc,
      type: [TransactionType.TRANSFER],
      pageSize: 100,
    })
  )

  const messages = resultSearch.data
    .map(tx => createMessage(tx as TransferTransaction))
    .filter(msg => (msg.signerAddress === signerAddress.plain()) && (msg.recipientId === currentUserId))

  return messages
}

export default userMessages



