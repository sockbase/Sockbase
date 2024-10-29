import { useCallback, useState } from 'react'
import { MdClose, MdMenu } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import LogotypeSVG from '../../assets/logotype.svg'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import useWindowDimension from '../../hooks/useWindowDimension'
import AuthenticateProvider from '../../libs/AuthenticateProvider'
import Root from '../Root'
import Sidebar from './Sidebar'
import type { SockbaseRole } from 'sockbase'

interface Props {
  title: string
  children: React.ReactNode
  allowAnonymous?: boolean
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
const DefaultLayout: React.FC<Props> = (props) => {
  const navigate = useNavigate()
  const { user, logoutAsync } = useFirebase()
  const { commonRole, systemRole } = useRole()
  const { isSmallDisplay } = useWindowDimension()

  const [showMenu, setIsShowMenu] = useState(false)

  const handleLogout = useCallback(() => {
    logoutAsync()
      .then(() => {
        navigate('/login')
      })
      .catch(err => { throw err })
  }, [])

  return (
    <AuthenticateProvider
      user={user}
      commonRole={commonRole}
      systemRole={systemRole}
      allowAnonymous={props.allowAnonymous}
      requireSystemRole={props.requireSystemRole}
      requireCommonRole={props.requireCommonRole}>
      <Root title={props.title}>
        <Container>
          <SidebarContainer>
            <HeaderWrap>
              <BrandArea>
                <BrandLogotype src={LogotypeSVG} alt="Logo" />
              </BrandArea>
              <MenuButtonArea>
                {isSmallDisplay && (
                  <MenuButton onClick={() => setIsShowMenu(!showMenu)}>
                    {showMenu ? <MdClose /> : <MdMenu />}
                  </MenuButton>
                )}
              </MenuButtonArea>
            </HeaderWrap>
            <MenuWrap>
              <Sidebar
                user={user}
                logout={handleLogout}
                commonRole={commonRole}
                systemRole={systemRole}
                showMenu={isSmallDisplay === false || showMenu}
                closeMenu={() => setIsShowMenu(false)}/>
            </MenuWrap>
          </SidebarContainer>
          <MainWrap>
            {props.children}
          </MainWrap>
        </Container>
      </Root>
    </AuthenticateProvider>
  )
}

export default DefaultLayout

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 280px 1fr;
  @media screen and (max-width: 840px) {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
  }
`
const SidebarContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  overflow-y: hidden;
  background-color: var(--background-light-color);
  color: var(--text-color);
`
const MainWrap = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`
const HeaderWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px;
  background-color: var(--background-gray-color);
`
const MenuWrap = styled.div`
  overflow-y: auto;
`
const BrandArea = styled.div`
  padding: 10px;
  font-size: 0;
`
const BrandLogotype = styled.img`
  height: 16px;
`
const MenuButtonArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0;
`
const MenuButton = styled.button`
  background: none;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  svg {
    width: 24px;
    height: 24px;
    color: var(--text-foreground-color);
  }
`
