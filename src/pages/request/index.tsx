import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
  Address,
  IListener,
  Transaction,
  TransactionGroup,
  TransactionType,
  Order,
  MosaicId,
} from 'symbol-sdk';

import {
  requestMosaicId,
} from '@/consts/blockchainProperty'

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

async function getRequestMessageTxs(address: Address): Promise<Transaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      recipientAddress: address, // me
      order: Order.Desc,
      transferMosaicId: new MosaicId(requestMosaicId),
      pageSize: 100,
    })
  );
  return resultSearch.data as Transaction[];
}

function Request(): JSX.Element {

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([]);

  // リスナ保持
  let listener: IListener;

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {

        setDataList(await getRequestMessageTxs(address));

        // リスナの二重登録を防ぐ
        if (listener === undefined) {
          // Start monitoring of transaction status with websocket
          listener = repo.createListener();
          //setListener(listener);

          await listener.open();
          listener
            .confirmed(address)
            .subscribe((confirmedTx: Transaction) => {
              console.log("LISTENER: TRANSACTION CONFIRMED");
              //console.dir({ confirmedTx }, { depth: null });
              setDataList(current => [confirmedTx, ...current]);
            });
          }
          console.log("LISTENER: STARTED");
      })();
    }
  },  [address, sssState]);

  return (
    <Layout>
      <table className="table">
        <thead>
          <tr>
            <th>許諾リクエスト</th>
            <th>送信元</th>
            <th>MosaicId</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td class="px-2">{ data?.message?.payload }</td>
              <td class="px-2">{ data.signer.address.address }</td>
              <td class="px-2">{ data.mosaics[0].id.toHex() }</td>
            </tr>
          ))}
        </tbody>
      </table>

    </Layout>
  );
}
export default Request;

