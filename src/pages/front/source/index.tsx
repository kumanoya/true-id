import { firstValueFrom } from "rxjs"
import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material'
import {
  Transaction,
  TransactionGroup,
  Order,
} from 'symbol-sdk'

//import { useUserInfo } from '@/store/UserInfoContext'
import useUserAccount from '@/hooks/useUserAccount'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory'
import { format } from "date-fns"
import { useRouter } from 'next/router'

const repo = createRepositoryFactory()

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
        const txRepo = repo.createTransactionRepository()

        const resultSearch = await firstValueFrom(
          txRepo.search({            // type: [TransactionType.AGGREGATE_BONDED],
            group: TransactionGroup.Confirmed,
            address: address,
            order: Order.Desc,
            pageSize: 100,
          })
        )
        console.log('resultSearch :', resultSearch)
        // setDataList(resultSearch.data)

        // データをグループ化し、各グループで最新のトランザクションを保持する
        const grouped: { [key: string]: Transaction } = resultSearch.data.reduce((tx, current) => {
          const address = current.signer?.address?.plain()
          if (address && ((!tx[address]) ||
            (tx[address]?.transactionInfo?.height ?? 0) < (current?.transactionInfo?.timestamp ?? 0))
          ) {
            tx[address] = current
          }
          return tx
        }, {} as { [key: string]: Transaction })

        const filteredDataList = Object.values(grouped)
        const sortedDataList = [...filteredDataList].sort((a, b) => {
          return Number(b.transactionInfo?.timestamp ?? 0) - Number(a.transactionInfo?.timestamp ?? 0)
        })
        setDataList(sortedDataList)

        console.log('filteredDataList ⚡️', filteredDataList)

        // Start monitoring of transaction status with websocket
        const listener = repo.createListener()
        await listener.open()
        listener
          .confirmed(address)
          .subscribe((confirmedTx: Transaction) => {
            console.log("EVENT: TRANSACTION CONFIRMED")
            //console.dir({ confirmedTx }, { depth: null })
            setDataList(current => [confirmedTx, ...current])
          })
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
