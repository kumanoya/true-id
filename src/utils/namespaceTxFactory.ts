import {
  Address,
  AggregateTransaction,
  AliasAction,
  AliasTransaction,
  Deadline,
  PublicAccount,
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

function createRootNamespaceRegistrationTx(rootName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const day = 60;
  const duration = UInt64.fromUint((24 * 60 * 60) / 30 * day);
  const feeMultiplier = 100; 

  // Create transaction
  return  NamespaceRegistrationTransaction.createRootNamespace(
    deadline,
    rootName,
    duration,
    networkType
  ).setMaxFee(feeMultiplier);
}

function createRootAddressAliasTx(rootName: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100; 

  // Create transaction
  return AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(rootName),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);
}

function createNamespaceRegistrationTx(parentName: string, name: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const tx = NamespaceRegistrationTransaction.createSubNamespace(
    deadline,
    name,
    parentName,
    networkType
  ).setMaxFee(feeMultiplier);

  return tx;
}

function createAddressAliasTx(parentName: string, name: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const aliasTransaction = AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(parentName + '.' + name),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
}

function createNamespaceRegistrationAndAliasTx(signer: PublicAccount, parentName: string, name: string, rawAddress: string): AggregateTransaction
{
  const registrationTx = createNamespaceRegistrationTx(parentName, name);
  const aliasTx = createAddressAliasTx(parentName, name, Address.createFromRawAddress(rawAddress));
  return aggregateTx([registrationTx, aliasTx], signer);
}

export {
  createRootNamespaceRegistrationTx,
  createRootAddressAliasTx,
  createNamespaceRegistrationTx,
  createAddressAliasTx,
  createNamespaceRegistrationAndAliasTx,
}
