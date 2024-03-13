import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

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
        </div>
      </div>
    </>
  )
}
export default Header
