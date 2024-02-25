import {
  Address,
  AggregateTransaction,
  AliasAction,
  AliasTransaction,
  Deadline,
  PublicAccount,
  MosaicId,
  NamespaceId,
  NamespaceRegistrationTransaction,
  Transaction,
  UInt64,
} from 'symbol-sdk';

import { aggregateTx } from '@/utils/aggregateTx';

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

function createNamespaceRegistrationTx(parentNamespace: string, namespaceName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  console.log('parentNamespace:', parentNamespace);
  console.log('namespaceName:', namespaceName);
  // Create transaction
  const tx = NamespaceRegistrationTransaction.createSubNamespace(
    deadline,
    namespaceName,
    parentNamespace,
    networkType
  ).setMaxFee(feeMultiplier);

  return tx;
}

function createAddressAliasTx(parentNamespace: string, namespaceName: string, address: string): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const aliasTransaction = AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(parentNamespace + '.' + namespaceName),
    Address.createFromRawAddress(address),
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
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

function createNamespaceRegistrationAndAliasTx(publicAccount: PublicAccount, parentNamespace: string, namespaceName: string, address: string): AggregateTransaction
{
  const registrationTx = createNamespaceRegistrationTx(parentNamespace, namespaceName);
  const aliasTx = createAddressAliasTx(parentNamespace, namespaceName, address);
  return aggregateTx([registrationTx, aliasTx], publicAccount);
}

export {
  createNamespaceRegistrationTx,
  createAddressAliasTx,
  createMosaicAliasTx,
  createNamespaceRegistrationAndAliasTx,
}
