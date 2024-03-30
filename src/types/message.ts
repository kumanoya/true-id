import {
  PublicAccount,
} from 'symbol-sdk'

interface Message {
  id: string|undefined,
  recipientId: string|undefined,
  recipientAddress: string,
  signerId: string|undefined,
  signerPublicKey: string,
  signerAddress: string,
  content: string|undefined,
  timestamp: number|undefined,  // unixtime(秒)
  height: string|undefined,
  rawMessage: string,
  signer: PublicAccount,
  replyToId: string|null,
}

export default Message
