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

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

function createRegistrationTx(parentNamespace: string, namespaceName: string): Transaction
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

function createAliasTx(parentNamespace: string, namespaceName: string, address: string): AliasTransaction
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

function createRegistrationAndAliasTx(publicAccount: PublicAccount, parentNamespace: string, namespaceName: string, address: string): AliasTransaction
{
  const registrationTx = createRegistrationTx(parentNamespace, namespaceName);
  const aliasTx = createAliasTx(parentNamespace, namespaceName, address);

  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const aggregateTx = AggregateTransaction.createComplete(
    deadline,
    [
      registrationTx.toAggregate(publicAccount),
      aliasTx.toAggregate(publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000),
  );
  return aggregateTx
}

export {
  createRegistrationTx,
  createAliasTx,
  createRegistrationAndAliasTx,
}
