import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import FrontLayout from '@/components/FrontLayout'
import { List, Avatar } from '@mui/material'
import { useUserInfo } from '@/store/UserInfoContext'
import latestMessages from '@/utils/latestMessages'
import { formatUnixTime } from '@/utils/formatUnixTime'
import { formatId } from '@/utils/formatId'
import Message from '@/types/message'
import MessageForm from '@/components/MessageForm'

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
      <div className="text-2xl font-bold mb-4 text-center bg-gray-800 text-white p-2 rounded">ユーザー一覧</div>
      <List sx={{ marginBottom: '10px', width: '500px', bgcolor: 'background.paper' }}>
        {messages.map((message, index) => (
          <a key={index} className="w-full px-4 py-4 flex cursor-pointer message-users-item" onClick={() => handleNavigate(message.signerId)} >
            <span className="mr-4 flex items-center">
              <Avatar alt={formatId(message.signerId)?? ''} src="/" />
            </span>
            <div className="w-full">
              <div className="w-full my-1 flex items-center justify-between">
                <span className="font-bold"> { formatId(message.signerId) } </span>
                <span className="mx-2 text-sm">{formatUnixTime(message.timestamp)}</span>
              </div>
              <div className=""> { message.content } </div>
            </div>
          </a>
        ))}
      </List>
      <MessageForm />

    </FrontLayout>
  )
}
export default Users
