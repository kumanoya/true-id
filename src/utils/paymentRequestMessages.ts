import {
  Address,
  TransactionGroup,
  TransactionType,
  TransferTransaction,
  Order,
  MosaicId,
} from 'symbol-sdk'
import {
  paymentRequestMosaicId,
} from '@/consts/blockchainProperty'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()
import createMessage from '@/utils/createMessage'
import Message from '@/types/message'

async function paymentRequestMessages(currentUserId: string, address: Address): Promise<Message[]>
{
  const resultSearch = await txRepo.search({
    type: [TransactionType.TRANSFER],
    group: TransactionGroup.Confirmed,
    address: address, // me
    order: Order.Desc,
    transferMosaicId: new MosaicId(paymentRequestMosaicId),
    pageSize: 20,
  }).toPromise()

  if (resultSearch === undefined) {
    return []
  }

  const txs = resultSearch.data as TransferTransaction[]
  //console.log("getPaymentRequestMessageTxs", txs)

  // Messageに変換
  const messages = txs.map(tx => createMessage(tx))
  const filtered = messages.filter(message => message.recipientId === currentUserId)
  //console.log("Filtered", filtered)
  return filtered
}

export default paymentRequestMessages


