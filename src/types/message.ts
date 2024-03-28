interface Message {
  id: string|undefined,
  recipientId: string|undefined,
  recipientAddress: string,
  signerId: string|undefined,
  signerPublicKey: string,
  signerAddress: string,
  content: string|undefined,
  timestamp: number|undefined,
  height: string|undefined,
  rawMessage: string,
}

export default Message
