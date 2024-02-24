import {
  Address,
  AggregateTransaction,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  PublicAccount,
  UInt64,
} from 'symbol-sdk'

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

function createCustomMosaicTx(publicAccount: PublicAccount, address: Address): AggregateTransaction
{
  const supplyMutable = false
  const transferable = true
  const restrictable = false

  /*
  deadline: Deadline
  nonce: MosaicNonce
  mosaicId: MosaicId
  flags: MosaicFlags
  divisibility: number
  duration: UInt64
  networkType: NetworkType
  maxFee?: UInt64
  signature?: string
  signer?: PublicAccount
  */
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後
  const nonce = MosaicNonce.createRandom()
  const defTx = MosaicDefinitionTransaction.create(
    deadline,
    nonce,
    MosaicId.createFromNonce(nonce, address),
    MosaicFlags.create(supplyMutable, transferable, restrictable),
    0,
    UInt64.fromUint(1000000),
    networkType
  )
  const supplyTx = MosaicSupplyChangeTransaction.create(
    deadline,
    defTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType,
  );
  const aggregateTx = AggregateTransaction.createComplete(
    deadline,
    [
      defTx.toAggregate(publicAccount),
      supplyTx.toAggregate(publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000),
  );
  return aggregateTx
}

export default createCustomMosaicTx
