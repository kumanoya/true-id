import {
  AggregateTransaction,
  Deadline,
  PublicAccount,
  Transaction,
  UInt64,
} from 'symbol-sdk'

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

export const aggregateTx = (transactions: Transaction[], signer: PublicAccount): AggregateTransaction =>
{
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const aggregateTx = AggregateTransaction.createComplete(
    deadline,
    transactions.map((tx) => tx.toAggregate(signer)),
    networkType,
    [],
    UInt64.fromUint(2000000),
  );
  return aggregateTx
}


