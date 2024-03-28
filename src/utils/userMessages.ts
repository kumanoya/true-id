import { firstValueFrom } from "rxjs"
import {
  TransactionType,
  TransferTransaction,
  TransactionGroup,
  Order,
  Address,
  NamespaceId,
} from 'symbol-sdk'
import Message from '@/types/message'
import createMessage from '@/utils/createMessage'
import namespaceToRawAddress from '@/utils/namespaceToRawAddress'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()

//==============================================================================
// userMessages
//==============================================================================
const userMessages = async (
  userId: string, // 送信者のID (サブネームスペース名）
  myAddress: Address,
  myId: string|null = null
): Promise<Message[]> => {

  // 送信者のIDからアドレスを取得
  const userAddress = await namespaceToRawAddress(userId)

  console.log("userMessages: userId:", userId)
  console.log("userMessages: userAddress:", userAddress)
  console.log("userMessages: myId:", myId)
  console.log("userMessages: myAddress:", myAddress)

  // 自分のアドレスが送信・受信のどちらかに含まれるメッセージを取得
  // Addressで粗く絞り込んで、その後でIDで絞り込む
  const resultSearch = await txRepo.search({
      group: TransactionGroup.Confirmed,
      address: myAddress,
      order: Order.Asc,
      type: [TransactionType.TRANSFER],
      pageSize: 100,
    }).toPromise()

  // この二者間の送受信メッセージを抽出
  const messages = resultSearch.data
    .map(tx => createMessage(tx as TransferTransaction))
    .filter(msg =>
      // A => B または B => A のメッセージを抽出
      ((msg.signerId === userId) && (msg.recipientId === myId)) ||
      ((msg.signerId === myId) && (msg.recipientId === userId))
     )

  console.log('filtered message count:', messages.length)

  return messages
}

export default userMessages



