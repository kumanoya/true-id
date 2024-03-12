import {
  AliasAction,
  AliasTransaction,
  AggregateTransaction,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  NamespaceId,
  PublicAccount,
  UInt64,
} from 'symbol-sdk'

import { aggregateTx } from '@/utils/aggregateTx';

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'
import { createRootNamespaceRegistrationTx } from './namespaceTxFactory';

const deadline = Deadline.create(epochAdjustment)

function createMosaicDefinitionTx(publicAccount: PublicAccount): MosaicDefinitionTransaction
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
  const nonce = MosaicNonce.createRandom()
  const defTx = MosaicDefinitionTransaction.create(
    deadline,
    nonce,
    MosaicId.createFromNonce(nonce, publicAccount.address),
    MosaicFlags.create(supplyMutable, transferable, restrictable),
    0,
    UInt64.fromUint(1000000),
    networkType
  )
  return defTx
}

function createMosaicSupplyTx(publicAccount: PublicAccount, mosaicId: MosaicId): MosaicSupplyChangeTransaction
{
  const supplyTx = MosaicSupplyChangeTransaction.create(
    deadline,
    mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType,
  );
  return supplyTx
  //return aggregateTx([defTx, supplyTx], publicAccount);
}

function createMosaicAliasTx(mosaicName: string, mosaicId: MosaicId): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const aliasTransaction = AliasTransaction.createForMosaic(
    deadline,
    AliasAction.Link,
    new NamespaceId(mosaicName),
    mosaicId,
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
}

function createMosaicRegistrationAggregateTx(publicAccount: PublicAccount, mosaicName: string): AggregateTransaction
{
  const defTx = createMosaicDefinitionTx(publicAccount)
  const supplyTx = createMosaicSupplyTx(publicAccount, defTx.mosaicId)
  const nsTx = createRootNamespaceRegistrationTx(mosaicName)
  const aliasTx = createMosaicAliasTx(mosaicName, defTx.mosaicId)

  return AggregateTransaction.createComplete(
    deadline,
    [
      defTx.toAggregate(publicAccount),
      supplyTx.toAggregate(publicAccount),
      nsTx.toAggregate(publicAccount),
      aliasTx.toAggregate(publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000),
  )
}

export {
  createMosaicDefinitionTx,
  createMosaicSupplyTx,
  createMosaicAliasTx,
  createMosaicRegistrationAggregateTx,
}
