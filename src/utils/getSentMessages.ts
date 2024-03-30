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
import createMessage from '@/utils/createMessage'
import Message from '@/types/message'

//==============================================================================
// getSentMessages
//==============================================================================
const getSentMessages = async (signerPublicKey: string, currentUserId: string|null = null): Promise<Message[]> => {
  const txRepo = repo.createTransactionRepository()

  const resultSearch = await txRepo.search({
      group: TransactionGroup.Confirmed,
      signerPublicKey: signerPublicKey,
      order: Order.Desc,
      type: [TransactionType.TRANSFER],
      pageSize: 1000,
    }).toPromise()

  if (resultSearch === undefined) {
    return []
  }

  const messages = resultSearch.data
    .map(tx => createMessage(tx as TransferTransaction))

  return messages
}

export default getSentMessages



