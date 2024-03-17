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
  loginRequestMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

async function createLoginRequestTx(accountName: string): Promise<Transaction>
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginRequestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(accountName)
  const feeMultiplier = 100

  // 宛先アドレスを取得
  // namespace宛に送ると受信側での受信処理が複雑になる(アドレスで絞り込みできない)のでaddressで送る
  const namespaceId = new NamespaceId(accountName)
  const namespaceInfo = await repo.createNamespaceRepository().getNamespace(namespaceId).toPromise()
  if (!namespaceInfo) {
    throw new Error('Invalid root namespace')
  }
  const recipientAddress = namespaceInfo.ownerAddress

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    recipientAddress, //namespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

export { createLoginRequestTx }
