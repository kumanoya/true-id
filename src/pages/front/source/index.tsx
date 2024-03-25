import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material'
import {
  Transaction,
} from 'symbol-sdk'
import { useUserInfo } from '@/store/UserInfoContext'
import groupedMessageTxs from '@/utils/groupedMessageTxs'
import { formatTimestamp } from '@/utils/formatTimestamp'

//==============================================================================
//  Source
//==============================================================================
function Source(): JSX.Element {

  // アドレス取得
  const { account } = useUserInfo()

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([])

  useEffect(() => {
    console.log('Account: ', account)
    if (account) {
      (async() => {
        const address = account.address
        const list = await groupedMessageTxs(address)
        setDataList(list)
      })()
    }
  },  [account])

  // TODO: 現在は仮。適切なルーティング設定を行う
  const handleNavigate = () => {
    //router.push('/')
  }

  return (
    <FrontLayout>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {dataList.map((data, index) => (
          <React.Fragment key={index}>
          <ListItem alignItems="flex-start" onClick={() => handleNavigate()}
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
              primary={data?.signer?.address?.plain()}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {data && 'message' in data ? (data.message as any).payload : ''}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemText primary={data.transactionInfo?.timestamp ? formatTimestamp(data.transactionInfo.timestamp).toString() : ''} style={{ textAlign: 'right' }} />
          </ListItem>
          {index < dataList.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
        ))}
      </List>

    </FrontLayout>
  )
}
export default Source
