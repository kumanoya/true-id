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

import { Home,
  Chat,
  Web,
  Settings,
  ListAlt,
  AddCircle,
  FaceRetouchingNatural,
  Notifications,
} from '@mui/icons-material';

import { useRouter } from 'next/router';
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
        <div className="left-drawer mt-4">
          <h1 className="mt-4 mx-4 text-lg">一般ユーザー</h1>
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
                  router.push('/front/source');
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
                  router.push('/front/request');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText primary={'ログインリクエスト一覧'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/front/account/register');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <FaceRetouchingNatural />
                </ListItemIcon>
                <ListItemText primary={'アカウントID申請'} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <h1 className="mt-4 mx-4 text-lg">アカウントプロバイダ</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <ListAlt />
                </ListItemIcon>
                <ListItemText primary={'ネームスペース管理'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin/register');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText primary={'アカウント申請一覧'} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <h1 className="mt-4 mx-4 text-lg">外部アプリテスト</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/webapp/');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Web />
                </ListItemIcon>
                <ListItemText primary={'TrueIDでログイン'} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <h1 className="mt-4 mx-4 text-lg">設定</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/settings/');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary={'設定：秘密鍵登録'} />
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
                  <AddCircle/>
                </ListItemIcon>
                <ListItemText primary={'カスタムモザイク作成'} />
              </ListItemButton>
            </ListItem>
          </List>

          <MyAccountList />
        </div>
      </Drawer>
    </>
  );
}
export default LeftDrawer;
