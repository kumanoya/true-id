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

import {
  Home,
  Chat,
  Web,
  Settings,
  ListAlt,
  AddCircle,
  FaceRetouchingNatural,
  Notifications,
  Help,
} from '@mui/icons-material';

import { useRouter } from 'next/router';

function LeftDrawer(props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const { isOpen, setIsOpen } = props;
  const router = useRouter();

  return (
    <>
      <Drawer anchor={'left'} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="left-drawer mt-4">
          <h1 className="mt-4 mx-4 text-lg">説明</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={'プロジェクトの目的と概要'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/usage');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <Help />
                </ListItemIcon>
                <ListItemText primary={'使い方'} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <h1 className="mt-4 mx-4 text-lg">一般ユーザー</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/front/account/register');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <FaceRetouchingNatural />
                </ListItemIcon>
                <ListItemText primary={'アカウント作成・ID申請'} />
              </ListItemButton>
            </ListItem>
          </List>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/front/');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <Chat />
                </ListItemIcon>
                <ListItemText primary={'メッセージ一覧'} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/front/request');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText primary={'ログインリクエスト一覧'} />
              </ListItemButton>
            </ListItem>

          <Divider />

          <h1 className="mt-4 mx-4 text-lg">アカウントプロバイダ</h1>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin');
                  setIsOpen(false);
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
                  setIsOpen(false);
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
                  setIsOpen(false);
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
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary={'秘密鍵登録'} />
              </ListItemButton>
            </ListItem>

            {/*
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/admin/mosaic/create');
                  setIsOpen(false);
                }}
              >
                <ListItemIcon>
                  <AddCircle/>
                </ListItemIcon>
                <ListItemText primary={'カスタムモザイク作成'} />
              </ListItemButton>
            </ListItem>
            */}

          </List>
        </div>
      </Drawer>
    </>
  );
}
export default LeftDrawer;
