import { useState, ReactNode } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import FrontHeader from '@/components/FrontHeader'
import { useLoginRequestHandler } from '@/hooks/useLoginRequestHandler'

type Props = { children: ReactNode }

const Layout = ({ children }: Props) => {

  useLoginRequestHandler()

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
