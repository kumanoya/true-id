import {
  Account,
} from 'symbol-sdk'

interface Message {
  id: string|undefined,
  recipientId: string|undefined,
  recipientAddress: string,
  signer: Account,
  signerId: string|undefined,
  signerPublicKey: string,
  signerAddress: string,
  content: string|undefined,
  timestamp: number|undefined,  // unixtime(秒)
  height: string|undefined,
  rawMessage: string,
}

export default Message
