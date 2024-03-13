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
        <div className="logo-wrap">
          <Image
            src='/trueid-logo-wh.svg'
            width={100}
            height={50}
            style={{
              width: 'auto',
              height: '18px',
            }}
            alt='logo'
          />
        </div>
        <span className="front-title">フロントアプリ</span>
      </div>
    </>
  );
}
export default Header;
