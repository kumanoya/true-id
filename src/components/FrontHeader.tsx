import { useState } from 'react'

import {
  AccountCircle
} from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'
import MyAccountList from '@/components/MyAccountList'
import { useUserInfo } from '@/store/UserInfoContext'
import { formatId } from '@/utils/formatId'

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false) //MyAccountListの設定

  // アカウント取得
  const { currentUserId, account } = useUserInfo()

  return (
    <>
      <div className="front-title">一般ユーザー</div>
      <div className="header">
        <div className="logo-wrap">
          <MenuIcon
            className="cursor-pointer"
            fontSize='large'
            sx={{ left: '20px', top: '15px' }}
            onClick={() => setIsMenuOpen(true)}
          />
          <div className="logo">
            <Image
              src='/trueid-logo.png'
              width={140}
              height={80}
              alt='logo'
            />
          </div>
        </div>

        <div className="cursor-pointer flex items-center" onClick={() => setIsAccountOpen(true)}>
          <span className="mx-2 font-bold">
            ユーザーID: { formatId(currentUserId) }
          </span>
          <AccountCircle 
            fontSize="large" />
        </div>
      </div>
      <MyAccountList account={account} isOpen={isAccountOpen} setIsOpen={setIsAccountOpen} />
    </>
  )
}
export default Header
