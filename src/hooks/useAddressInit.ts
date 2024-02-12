import { useState, useEffect } from 'react';
import { sssState } from '@/types/sssState';
import { useRouter } from 'next/router';
import {
  networkType,
} from '@/consts/blockchainProperty';

import {
  PublicAccount,
  Address,
} from 'symbol-sdk';

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
  isAllowedSSS: () => boolean;
}
declare const window: SSSWindow;

const useAddressInit = (clientPublicKey: string, sssState: sssState) => {

  const router = useRouter();
  // client address string
  const [clientAddress, setClientAddress] = useState<string>('');
  useEffect(() => {

    if (sssState === 'ACTIVE') {
      const clientPublicAccount = PublicAccount.createFromPublicKey(clientPublicKey, networkType);
      setClientAddress(clientPublicAccount.address.plain());
    } else if (sssState === 'INACTIVE' || sssState === 'NONE') {
      router.push('/sss');
    }
  }, [clientPublicKey, sssState]);

  // Address object
  const [address, setAddress] = useState<Address>();
  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      setAddress(Address.createFromRawAddress(clientAddress));
    }
  }, [clientAddress, sssState]);

  return { clientAddress, address };
};

export default useAddressInit;

