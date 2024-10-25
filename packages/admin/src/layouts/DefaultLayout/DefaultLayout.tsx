import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
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
          <SidebarWrap>
            <Sidebar
              user={user}
              logout={handleLogout}
              commonRole={commonRole}
              systemRole={systemRole} />
          </SidebarWrap>
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
const SidebarWrap = styled.div``
const MainWrap = styled.div`
  padding: 20px;
`
