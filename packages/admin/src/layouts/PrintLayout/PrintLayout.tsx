import styled from 'styled-components'
import { type SockbaseRole } from 'sockbase'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import AuthenticateProvider from '../../libs/AuthenticateProvider'
import Root from '../Root'

interface Props {
  title: string
  children: React.ReactNode
  allowAnonymous?: boolean
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}

const PrintLayout: React.FC<Props> = props => {
  const { user } = useFirebase()
  const { commonRole, systemRole } = useRole()

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
          {props.children}
        </Container>
      </Root>
    </AuthenticateProvider>
  )
}

export default PrintLayout

const Container = styled.div`
`
