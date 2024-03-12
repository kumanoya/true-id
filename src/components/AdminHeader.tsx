import React from 'react';
import { Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
function Header(props: {
  setOpenLeftDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const {
    setOpenLeftDrawer, //LeftDrawerの設定
  } = props;

  return (
    <>
      <div className="header">
        <MenuIcon
          fontSize='large'
          sx={{ position: 'absolute', left: '20px', top: '15px' }}
          onClick={() => setOpenLeftDrawer(true)}
        />
        <Image
          src='/true-id.png'
          width={2048}
          height={472}
          style={{
            width: 'auto',
            height: '50px',
          }}
          alt='logo'
        />
        <span className="admin-title">IDプロバイダーアプリ</span>
      </div>
    </>
  );
}
export default Header;
