import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material'
import {
  Transaction,
} from 'symbol-sdk'

//import { useUserInfo } from '@/store/UserInfoContext'
import useUserAccount from '@/hooks/useUserAccount'
import groupedMessageTxs from '@/utils/groupedMessageTxs'

import { format } from "date-fns"
import { useRouter } from 'next/router'

function formatTimestamp(timestamp: { lower: number; higher: number }): string {
  // UNIXタイムスタンプをミリ秒単位で計算
  const unixTimestamp = (timestamp.higher * 4294967296 + timestamp.lower) / 1000

  // Dateオブジェクトを生成
  const date = new Date(unixTimestamp * 1000)

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm")
}

//==============================================================================
//  Source
//==============================================================================
function Source(): JSX.Element {
  const router = useRouter()

  // アドレス取得
  //const { account } = useUserInfo()
  const userAccount = useUserAccount()

  // メッセージ一覧表示用
  const [dataList, setDataList] = useState<Transaction[]>([])

  useEffect(() => {
    console.log('Account: ', userAccount)
    if (userAccount) {
      (async() => {
        const address = userAccount.address
        const list = await groupedMessageTxs(address)
        setDataList(list)
      })()
    }
  },  [userAccount])

  // TODO: 現在は仮。適切なルーティング設定を行う
  const handleNavigate = () => {
    router.push('/')
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
