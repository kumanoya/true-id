import {
  TransferTransaction,
} from 'symbol-sdk'
import Message from '@/types/message'
import timestampToUnixTime from '@/utils/timestampToUnixTime'

function isJson(text: string): boolean {
  try {
    JSON.parse(text)
  } catch (error) {
    return false
  }
  return true
}

function createMessage(tx: TransferTransaction): Message
{
  const message =  {
    id:                tx.transactionInfo?.id,
    recipientId:       undefined,
    recipientAddress:  tx.recipientAddress?.plain(),
    signerId:          undefined,
    signerPublicKey:   tx.signer?.publicKey,
    signerAddress:     tx.signer?.address.plain(),
    content:           undefined,
    timestamp:         tx.transactionInfo?.timestamp? timestampToUnixTime(tx.transactionInfo?.timestamp) : undefined,
    height:            tx.transactionInfo?.height.toString(),
    rawMessage:        tx.message.payload,
  }

  // payloadにJSONでエンコードされている値を取り出す
  if (isJson(message.rawMessage)) {
    const data = JSON.parse(message.rawMessage)
    message.recipientId = data.recipientId
    message.signerId = data.signerId
    message.content = data.content
  }

  return message
}

export default createMessage
