import { useCallback, useState } from 'react'
import { MdClose, MdMenu } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
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
const DefaultLayout: React.FC<Props> = props => {
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
      allowAnonymous={props.allowAnonymous}
      commonRole={commonRole}
      requireCommonRole={props.requireCommonRole}
      requireSystemRole={props.requireSystemRole}
      systemRole={systemRole}
      user={user}>
      <Root title={props.title}>
        <Container>
          <SidebarContainer>
            <HeaderWrap>
              <BrandArea>
                <Link to="/"><BrandLogotype
                  alt="Logo"
                  src={LogotypeSVG} />
                </Link>
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
                closeMenu={() => setIsShowMenu(false)}
                commonRole={commonRole}
                logout={handleLogout}
                showMenu={isSmallDisplay === false || showMenu}
                systemRole={systemRole}
                user={user} />
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
  background-color: var(--panel-background-color);
  color: var(--text-color);
`
const MainWrap = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`
const HeaderWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 36px;
  background-color: var(--brand-background-color);
  border-left: 24px solid var(--brand-color);
  @media screen and (max-width: 840px) {
    border-left: none;
  }
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

  @media screen and (max-width: 840px) {
    background-color: var(--brand-color);
  }
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
    color: var(--white-color);
  }
`
