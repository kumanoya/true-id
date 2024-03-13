import { useState, ReactNode } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import AdminHeader from '@/components/AdminHeader'

type Props = { children: ReactNode }

const Layout = ({ children }: Props) => {

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false) //LeftDrawerの設定

  return <>
      <AdminHeader setIsMenuOpen={setIsMenuOpen} />
      <LeftDrawer isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <div className="flex justify-center p-4">
        <div>{children}</div>
      </div>
  </>
}

export default Layout
