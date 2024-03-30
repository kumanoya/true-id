import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'
import useAdminAccount from '@/hooks/useAdminAccount';

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

  // アカウント取得
  const account = useAdminAccount()

  return (
    <>
      <div className="header">
        <div className="logo-wrap">
          <MenuIcon
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
          <span className="admin-title">アカウントプロバイダー</span>
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
