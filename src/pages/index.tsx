import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  PublicAccount,
  TransactionGroup,
  Address,
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  PlainMessage,
  Transaction,
  TransferTransaction,
  RepositoryFactoryHttp,
  SignedTransaction,
} from 'symbol-sdk';

import {
  currencyMosaicID,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

import { connectNode } from '@/utils/connectNode';
import { nodeList } from '@/consts/nodeList';

import useSssInit from '@/hooks/useSssInit';
import { useRouter } from 'next/router';
import { searchEscrow } from '@/utils/searchEscrow';
import CardEscrowPartial from '@/components/CardEscrowPartial';
import { escrowAggregateTransaction } from '@/types/escrowAggregateTransaction';

function createMessageTransaction(recipientRawAddress: string, rawMessage: string, xym: number): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6; // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const recipientAddress = Address.createFromRawAddress(recipientRawAddress);
  const absoluteAmount =
    xym * parseInt("1" + "0".repeat(networkCurrencyDivisibility)); // networkCurrencyDivisibility = 6 => 1[XYM] = 10^6[μXYM]
  const absoluteAmountUInt64 = UInt64.fromUint(absoluteAmount);
  const mosaic = new Mosaic(new MosaicId(currencyMosaicID), absoluteAmountUInt64);
  const mosaics = [mosaic];
  const plainMessage = PlainMessage.create(rawMessage); // 平文メッセージ
  const feeMultiplier = 100; // トランザクション手数料に影響する。現時点ではデフォルトのノードは手数料倍率が100で、多くのノードがこれ以下の数値を指定しており、100を指定しておけば素早く承認される傾向。

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    recipientAddress,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier);

  return transferTransaction;
}

function Home(): JSX.Element {
  //共通設定
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const router = useRouter();

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();
  const [clientAddress, setClientAddress] = useState<string>('');
  const [escrowDataList, setescrowDataList] = useState<escrowAggregateTransaction[]>([]);
  // CUSTOM REACTIVE VARIABLES
  const [address, setAddress] = useState<Address>();

  //SSS用設定
  interface SSSWindow extends Window {
    SSS: any;
    isAllowedSSS: () => boolean;
  }
  declare const window: SSSWindow;

  useEffect(() => {
    if (sssState === 'ACTIVE') {
      const clientPublicAccount = PublicAccount.createFromPublicKey(clientPublicKey, networkType);
      setClientAddress(clientPublicAccount.address.plain());
    } else if (sssState === 'INACTIVE' || sssState === 'NONE') {
      router.push('/sss');
    }
  }, [clientPublicKey, sssState, router]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      initalescrowDataList();
      setProgress(false);

      // CUSTOM LOGIC
      setAddress(Address.createFromRawAddress(clientAddress));
      const transferTx = createMessageTransaction(clientAddress, 'Hello, World!', 0);
      console.log(transferTx);
      window.SSS.setTransaction(transferTx);

      (async () => {
        const NODE = "https://sym-test-03.opening-line.jp:3001";
        //const NODE = await connectNode(nodeList);
        //if (NODE === '') return undefined;

        const signedTx: SignedTransaction = await new Promise((resolve) => {
          resolve(window.SSS.requestSign());
        });

        const repo = new RepositoryFactoryHttp(NODE, {
          websocketUrl: NODE.replace('http', 'ws') + '/ws',
          websocketInjected: WebSocket,
        });
        const txRepo = repo.createTransactionRepository();
        txRepo.announce(signedTx);
      })();
    }
  }, [clientAddress, sssState]);

  const initalescrowDataList = async () => {
    const result = await searchEscrow(clientAddress, TransactionGroup.Partial);
    if (result === undefined) return;
    setescrowDataList(result);
  };

  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />

      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            あなたのアドレス
          </Typography>
          { address.plain() }
        </Box>
      )}

      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            取引一覧
          </Typography>

          {escrowDataList.map((escrowData, index) => (
            <Box key={index} mb={1}>
              <CardEscrowPartial
                key={index}
                clientAddress={clientAddress}
                escrowData={escrowData}
              />
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
export default Home;
