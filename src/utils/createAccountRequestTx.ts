import {
  Address,
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
  accountRegisterMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

async function createAccountRequestTx(rootNamespace: string, accountName: string, address: Address): Promise<Transaction>
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  const absoluteAmountUInt64 = UInt64.fromUint(0)

  // リクエスト専用のMosaicを送る
  const mosaic = new Mosaic(new MosaicId(accountRegisterMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(rootNamespace + ':' + accountName) // 平文メッセージに希望アカウント名とアドレスをエンコード
  const feeMultiplier = 100

  // 宛先アドレスを取得
  // namespace宛に送ると管理側での受信処理が複雑になるのでaddressで送る
  const namespaceId = new NamespaceId(rootNamespace)
  const namespaceInfo = await repo.createNamespaceRepository().getNamespace(namespaceId).toPromise()
  if (!namespaceInfo) {
    throw new Error('Invalid root namespace')
  }
  const providerAddress = namespaceInfo.ownerAddress

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    providerAddress, //namespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

export { createAccountRequestTx }
