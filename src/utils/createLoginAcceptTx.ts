import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  Address,
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

function createLoginAcceptTx(appId: string, currentUserId: string): Transaction
{
  console.log("createLoginAcceptTx", appId)
  const id = unformatId(currentUserId)

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginAcceptMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(id)
  const feeMultiplier = 100

  const appNamespaceId = new NamespaceId(appId)

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
