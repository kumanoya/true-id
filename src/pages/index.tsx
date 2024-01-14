import { firstValueFrom } from "rxjs";
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  PublicAccount,
  TransactionGroup,
  Address,
  Account,
} from 'symbol-sdk';
import useSssInit from '@/hooks/useSssInit';
import { networkType } from '@/consts/blockchainProperty';
import { useRouter } from 'next/router';
import { searchEscrow } from '@/utils/searchEscrow';
import CardEscrowPartial from '@/components/CardEscrowPartial';
import { escrowAggregateTransaction } from '@/types/escrowAggregateTransaction';

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
