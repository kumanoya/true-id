import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import FrontLayout from '@/components/FrontLayout'
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material'
import { useUserInfo } from '@/store/UserInfoContext'
import latestMessages from '@/utils/latestMessages'
import { formatTimestamp } from '@/utils/formatTimestamp'
import Message from '@/types/message'

//==============================================================================
//  Users
//==============================================================================
function Users(): JSX.Element {

  // アドレス取得
  const { account, currentUserId } = useUserInfo()

  // メッセージ一覧表示用
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    console.log('Account: ', account)
    if (account) {
      (async() => {
        const address = account.address
        const list = await latestMessages(address, currentUserId)
        setMessages(list)
      })()
    }
  },  [account])

  // TODO: 現在は仮。適切なルーティング設定を行う
  const router = useRouter()
  const handleNavigate = (address: string) => {
    router.push('/front/users/' + address)
  }

  return (
    <FrontLayout>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
          <ListItem alignItems="flex-start" onClick={() => handleNavigate(message.signerAddress)}
            sx={{
              '&:hover': {
                cursor: 'pointer', // マウスホバー時にカーソルを指に変更
              }
            }}
          >
            <ListItemAvatar>
              <Avatar alt="Dummy" src="/" />
            </ListItemAvatar>
            <ListItemText
              primary={message.signerAddress}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    { message.content }
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemText primary={formatTimestamp(message.timestamp)} style={{ textAlign: 'right' }} />
          </ListItem>
          {index < messages.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
        ))}
      </List>

    </FrontLayout>
  )
}
export default Users
