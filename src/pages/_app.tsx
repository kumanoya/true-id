import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import '../globals.css'
import '@/consts/colors.css';

import { UserInfoProvider } from '../store/UserInfoContext'

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <UserInfoProvider>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </UserInfoProvider>
  );
};
export default MyApp;
