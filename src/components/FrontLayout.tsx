import { useState, ReactNode } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import FrontHeader from '@/components/FrontHeader'
import { useRequestTxHandler } from '@/hooks/useRequestTxHandler'

type Props = { children: ReactNode }

const Layout = ({ children }: Props) => {

  useRequestTxHandler()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false) //LeftDrawerの設定

  return <>
    <FrontHeader setIsMenuOpen={setIsMenuOpen} />
    <LeftDrawer isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    <div className="flex justify-center p-4">
      <div>{children}</div>
    </div>
  </>
}

export default Layout
