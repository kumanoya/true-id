import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import FrontLayout from '@/components/FrontLayout';
import {
  Address,
  IListener,
  Transaction,
  TransactionGroup,
  TransactionType,
  TransferTransaction,
  Order,
  MosaicId,
} from 'symbol-sdk';

import {
  loginRequestMosaicId,
} from '@/consts/blockchainProperty'

import useUserAccount from '@/hooks/useUserAccount';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

async function getRequestMessageTxs(address: Address): Promise<TransferTransaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      recipientAddress: address, // me
      order: Order.Desc,
      transferMosaicId: new MosaicId(loginRequestMosaicId),
      pageSize: 100,
    })
  );
  return resultSearch.data as TransferTransaction[];
}

function Request(): JSX.Element {

  // アカウント取得
  const userAccount = useUserAccount()

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<TransferTransaction[]>([]);

  // リスナ保持
  let listener: IListener;

  useEffect(() => {
    if (userAccount !== undefined) {
      (async() => {

        setDataList(await getRequestMessageTxs(userAccount.address));

        // リスナの二重登録を防ぐ
        if (listener === undefined) {
          // Start monitoring of transaction status with websocket
          listener = repo.createListener();
          //setListener(listener);

          await listener.open();
          listener
            .confirmed(userAccount.address)
            .subscribe((confirmedTx: Transaction) => {
              console.log("LISTENER: TRANSACTION CONFIRMED");
              //console.dir({ confirmedTx }, { depth: null });
              setDataList(current => [confirmedTx as TransferTransaction, ...current]);
            });
          }
          console.log("LISTENER: STARTED");
      })();
    }
  },  [userAccount]);

  return (
    <FrontLayout>
      <table className="table">
        <thead>
          <tr>
            <th>ログインリクエスト</th>
            <th>送信元</th>
            <th>MosaicId</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td className="px-2">{ data?.message?.payload }</td>
              <td className="px-2">{ data.signer?.address?.plain() }</td>
              <td className="px-2">{ data.mosaics[0].id.toHex() }</td>
            </tr>
          ))}
        </tbody>
      </table>

    </FrontLayout>
  );
}
export default Request;

