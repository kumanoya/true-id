import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  Address,
  PlainMessage,
  Transaction,
  TransferTransaction,
} from 'symbol-sdk'
import {
  loginRequestMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'
import namespaceToRawAddress from '@/utils/namespaceToRawAddress'
import { unformatId } from '@/utils/formatId'

async function createLoginRequestTx(userId: string): Promise<Transaction>
{
  const id = unformatId(userId)

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginRequestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(id)
  const feeMultiplier = 100

  // 宛先アドレスを取得
  const recipientRawAddress = await namespaceToRawAddress(id)
  if (recipientRawAddress === null) {
    throw new Error('Recipient address is invalid')
  }

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    Address.createFromRawAddress(recipientRawAddress),
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

export { createLoginRequestTx }
