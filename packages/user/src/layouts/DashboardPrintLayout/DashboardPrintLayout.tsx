import styled from 'styled-components'
import useFirebase from '../../hooks/useFirebase'
import HeadHelper from '../../libs/Helmet'
import RequiredLogin from '../../libs/RequiredLogin'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardPrintLayout: React.FC<Props> = props => {
  const { user } = useFirebase()

  return (
    <Container>
      <RequiredLogin />
      <HeadHelper title={props.title} />
      {user && props.children}
    </Container>
  )
}

export default DashboardPrintLayout

const Container = styled.div`
`
