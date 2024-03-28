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
          <span className="front-title">一般ユーザーアプリ</span>
        </div>

        <div className="cursor-pointer flex items-center" onClick={() => setIsAccountOpen(true)}>
          <span className="mx-2 font-bold">
            ID: { formatId(currentUserId) }
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
