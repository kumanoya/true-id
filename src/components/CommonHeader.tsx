import MenuIcon from '@mui/icons-material/Menu'
import Image from 'next/image'

type Props = { setIsMenuOpen: any }

function Header({ setIsMenuOpen }: Props): JSX.Element {

  return (
    <>
      <div className="header">
        <div className="logo-wrap">
          <MenuIcon
            className='cursor-pointer'
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
      </div>
    </>
  )
}
export default Header
