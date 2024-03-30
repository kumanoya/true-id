import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  PlainMessage,
  Transaction,
  TransferTransaction,
  NamespaceId,
} from 'symbol-sdk'
import {
  paymentRequestMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'
import { unformatId } from '@/utils/formatId'

async function createPaymentRequestTx(userId: string, appId: string, amount: number): Promise<Transaction>
{
  const id = unformatId(userId)

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // 専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(paymentRequestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const feeMultiplier = 100

  // 宛先NamespaceId準備
  const userNamespaceId = new NamespaceId(userId)

  const message = {
    recipientId: id,
    content: amount,
    signerId: appId,
  }
  const plainMessage = PlainMessage.create(JSON.stringify(message)) // 平文メッセージ

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    userNamespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

export { createPaymentRequestTx }
