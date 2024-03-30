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
  loginAcceptMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'
import { unformatId } from '@/utils/formatId'

function createLoginAcceptTx(appId: string, userId: string): Transaction
{
  const id = unformatId(userId)

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // 専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginAcceptMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const feeMultiplier = 100

  // 宛先NamespaceId準備
  const appNamespaceId = new NamespaceId(appId)

  const message = {
    recipientId: id,
    content: id,
    signerId: appId,
  }
  const plainMessage = PlainMessage.create(JSON.stringify(message)) // 平文メッセージ

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    appNamespaceId,  // appId is the application's root namespace
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

export { createLoginAcceptTx }
