import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'
import useAppAccount from '@/hooks/useAppAccount';

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

  // アカウント取得
  const { appId } = useAppAccount()

  return (
    <>
      <div className="webapp-title">外部連携アプリ</div>
      <div className="header">
        <div className="logo-wrap">
          <MenuIcon
            fontSize='large'
            sx={{ left: '20px', top: '15px' }}
            onClick={() => setIsMenuOpen(true)}
          />
          <span className="mx-4 text-2xl">
          { appId }
          </span>
        </div>
      </div>
    </>
  )
}
export default Header
