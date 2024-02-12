import { useState, useEffect } from 'react';
import { sssState } from '@/types/sssState';

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
  isAllowedSSS: () => boolean;
}
declare const window: SSSWindow;

const useSssInit = () => {
  const [sssState, setSssState] = useState<sssState>('LOADING');
  const [clientPublicKey, setClientPublicKey] = useState<string>('');

  useEffect(() => {
    try {
      if (window.isAllowedSSS()) {
        setSssState('ACTIVE');
        const publicKey = window.SSS.activePublicKey;
        setClientPublicKey(publicKey);
      } else {
        setSssState('INACTIVE');
      }
    } catch (e) {
      console.error(e);
      setSssState('NONE');
    }
  }, []);

  return { clientPublicKey, sssState };
};

export default useSssInit;
