import { useState, ReactNode } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import WebappHeader from '@/components/WebappHeader'

type Props = { children: ReactNode }

const Layout = ({ children }: Props) => {

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false) //LeftDrawerの設定

  return <>
      <WebappHeader setIsMenuOpen={setIsMenuOpen} />
      <LeftDrawer isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <div className="flex justify-center p-4">
        <div>{children}</div>
      </div>
  </>
}

export default Layout
