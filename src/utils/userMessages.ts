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
  signerId: string, // 送信者のID (サブネームスペース名）
  recipientAddress: Address,
  recipientId: string|null = null
): Promise<Message[]> => {

  // 送信者のIDからアドレスを取得
  const signerRawAddress = await namespaceToRawAddress(signerId)

  console.log("userMessages: signerId:", signerId)
  console.log("userMessages: signerRawAddress:", signerRawAddress)
  console.log("userMessages: recipientId:", recipientId)
  console.log("userMessages: recipientAddress:", recipientAddress)

  // 自分のアドレスが送信・受信のどちらかに含まれるメッセージを取得
  // Addressで粗く絞り込んで、その後でIDで絞り込む
  const resultSearch = await txRepo.search({
      group: TransactionGroup.Confirmed,
      address: recipientAddress,
      order: Order.Desc,
      type: [TransactionType.TRANSFER],
      pageSize: 100,
    }).toPromise()

  // 特定IDとの送信・受診メッセージのみを抽出
  const messages = resultSearch.data
    .map(tx => createMessage(tx as TransferTransaction))
    .filter(msg =>
      // 送信・又は受信者IDが一致するメッセージのみを抽出
      ((msg.signerId === signerId) || (msg.recipientId === recipientId))
     )

  console.log('filtered message count:', messages.length)

  return messages
}

export default userMessages



