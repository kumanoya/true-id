import { useState, ReactNode } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import FrontHeader from '@/components/FrontHeader';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {

  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定

  return <>
      <FrontHeader setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />
      <div>{children}</div>
  </>

};

export default Layout;