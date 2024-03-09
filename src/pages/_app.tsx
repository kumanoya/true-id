import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import '../globals.css'
import '@/consts/colors.css';

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
};
export default MyApp;
