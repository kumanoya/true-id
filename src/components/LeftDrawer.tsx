import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {Home, ArrowCircleUp, Chat} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Image from 'next/image';
import MyAccountList from '@/components/MyAccountList';

function LeftDrawer(props: {
  openLeftDrawer: boolean;
  setOpenLeftDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const { openLeftDrawer, setOpenLeftDrawer } = props;
  const router = useRouter();

  return (
    <>
      <Drawer anchor={'left'} open={openLeftDrawer} onClose={() => setOpenLeftDrawer(false)}>
        <Box sx={{ width: '65vw', height: '100vh' }}>
          <List>
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
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
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={'ホーム'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/source');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Chat />
                </ListItemIcon>
                <ListItemText primary={'メッセージ'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/request');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={'許諾リクエスト一覧'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/account/register');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={'アカウントID申請'} />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <ArrowCircleUp />
                </ListItemIcon>
                <ListItemText primary={'IDプロバイダ:ネームスペース管理'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin/mosaic/create');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <ArrowCircleUp/>
                </ListItemIcon>
                <ListItemText primary={'IDプロバイダ:カスタムモザイク作成（仮）'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/webapp/');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <ArrowCircleUp />
                </ListItemIcon>
                <ListItemText primary={'ウェブログインテスト'} />
              </ListItemButton>
            </ListItem>
          </List>
          <MyAccountList />
        </Box>
      </Drawer>
    </>
  );
}
export default LeftDrawer;
