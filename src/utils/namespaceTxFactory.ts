import {
  Address,
  AliasAction,
  AliasTransaction,
  Deadline,
  NamespaceId,
  NamespaceRegistrationTransaction,
  Transaction,
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

export {
  createRegistrationTx,
  createAliasTx,
}
