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
            className="cursor-pointer"
            fontSize='large'
            sx={{ left: '20px', top: '15px' }}
            onClick={() => setIsMenuOpen(true)}
          />
        </div>
      </div>
    </>
  )
}
export default Header
