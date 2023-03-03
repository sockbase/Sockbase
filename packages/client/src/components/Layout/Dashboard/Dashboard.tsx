
import styled from 'styled-components'

import HeadHelper from '../../../libs/Helmet'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardLayout: React.FC<Props> = (props) => {
  return (
    <StyledLayout>
      <HeadHelper title={props.title} />
      DashboardLayout
      {props.children}
    </StyledLayout>
  )
}

export default DashboardLayout

const StyledLayout = styled.div`
  
`
