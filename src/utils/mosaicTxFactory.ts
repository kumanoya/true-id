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
import {createNamespaceRegistrationTx} from './namespaceTxFactory';

function createRootMosaicRegistrationTx(publicAccount: PublicAccount): AggregateTransaction
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
  const deadline = Deadline.create(epochAdjustment)
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
  const supplyTx = MosaicSupplyChangeTransaction.create(
    deadline,
    defTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType,
  );
  return aggregateTx([defTx, supplyTx], publicAccount);
}

function createRootMosaicAliasTx(mosaicName: string, mosaicId: MosaicId): AliasTransaction
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

function createRootMosaicRegistrationAndAliasTx(publicAccount: PublicAccount, mosaicName: string): AggregateTransaction
{
  const registerAggTx = createRootMosaicRegistrationTx(publicAccount)
  const defTx = registerAggTx.innerTransactions[0] as MosaicDefinitionTransaction
  const namespaceRegistrationTx = createNamespaceRegistrationTx(mosaicName, defTx.mosaicId)
  const aliasTx = createRootMosaicAliasTx(mosaicName, defTx.mosaicId)
  return registerAggTx.addTransactions([
    namespaceRegistrationTx.toAggregate(publicAccount),
    aliasTx.toAggregate(publicAccount),
  ])
}

export {
  createRootMosaicRegistrationTx,
  createRootMosaicAliasTx,
  createRootMosaicRegistrationAndAliasTx,
}
