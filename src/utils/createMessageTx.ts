import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  NamespaceId,
  PlainMessage,
  Transaction,
  TransferTransaction,
} from 'symbol-sdk'

import {
  currencyMosaicID,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'


function createMessageTx(recipientId: string, rawMessage: string, xym: number, currentUserId: string|null = null): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6 // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後
  const recipientNamespaceId = new NamespaceId(recipientId)

  const absoluteAmount =
    xym * parseInt("1" + "0".repeat(networkCurrencyDivisibility)) // networkCurrencyDivisibility = 6 => 1[XYM] = 10^6[μXYM]
  const absoluteAmountUInt64 = UInt64.fromUint(absoluteAmount)
  const mosaic = new Mosaic(new MosaicId(currencyMosaicID), absoluteAmountUInt64)
  const mosaics = [mosaic]

  const message = {
    recipientId: recipientId,
    content: rawMessage,
    signerId: currentUserId,
  }

  const plainMessage = PlainMessage.create(JSON.stringify(message)) // 平文メッセージ
  const feeMultiplier = 100

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    recipientNamespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}


export default createMessageTx
