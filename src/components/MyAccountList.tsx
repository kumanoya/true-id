import React, { useEffect, useState } from 'react';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  NamespaceName,
  IListener,
} from 'symbol-sdk';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

function MyAccountList(): JSX.Element {

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  const [accountNames, setAccountNames] = useState<string[]>([]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        repo.createNamespaceRepository().getAccountsNames([address]).subscribe((names) => {
          console.log("NAMES[]: ", names)
          const accountNames = names[0].names.map((namespaceName: NamespaceName) => namespaceName.name).sort()
          setAccountNames(accountNames)
        })
      })();
    }
  },  [address, sssState]);

  return (
    <>
      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='flex-start'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            あなたのアドレス
          </Typography>
          { address.plain() }
          <ul>
            {accountNames.map((name) => (
              <li key={name}>
                <span>{ name }</span>
              </li>
            ))}
          </ul>
        </Box>
      )}

    </>
  );
}
export default MyAccountList;

