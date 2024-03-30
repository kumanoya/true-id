import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'
import useAdminAccount from '@/hooks/useAdminAccount';

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

  // アカウント取得
  const account = useAdminAccount()

  return (
    <>
      <div className="admin-title">アカウントプロバイダー</div>
      <div className="header">
        <div className="logo-wrap cursor-pointer">
          <MenuIcon
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
        <div>
          <span>
            { account?.address.pretty().split('-')[0] + '-...' }
          </span>
        </div>
      </div>
    </>
  )
}
export default Header
