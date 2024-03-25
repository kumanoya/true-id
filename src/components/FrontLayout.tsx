import { useState, ReactNode } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import FrontHeader from '@/components/FrontHeader'
import { UserInfoProvider } from '../store/UserInfoContext'

type Props = { children: ReactNode }

const Layout = ({ children }: Props) => {

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false) //LeftDrawerの設定

  return <>
    <UserInfoProvider>
      <FrontHeader setIsMenuOpen={setIsMenuOpen} />
      <LeftDrawer isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <div className="flex justify-center p-4">
        <div>{children}</div>
      </div>
    </UserInfoProvider>
  </>
}

export default Layout
