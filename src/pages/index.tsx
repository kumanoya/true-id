import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import MessageForm from '@/components/MessageForm';
import { Typography } from '@mui/material';
import {
  Address,
  IListener,
  Transaction,
  TransactionGroup,
  TransactionType,
  Order,
} from 'symbol-sdk';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

async function getMessageTxs(address: Address): Promise<Transaction[]> {
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.TRANSFER],
      group: TransactionGroup.Confirmed,
      address: address,
      order: Order.Desc,
      pageSize: 100,
    })
  );
  console.log('resultSearch :', resultSearch);
  return resultSearch.data as Transaction[];
}

function Home(): JSX.Element {

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
        setDataList(await getMessageTxs(address));

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
      <MessageForm />
      <Typography component='div' variant='h6' mt={5} mb={1}>
        メッセージ一覧
      </Typography>
      <table>
        <thead>
          <tr>
            <th>メッセージ</th>
            <th>送信元</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td>{ data?.message?.payload }</td>
              <td>{ data.signer.address.address }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
export default Home;
