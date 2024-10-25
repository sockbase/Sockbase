import styled from 'styled-components'
import HeadHelper from '../../libs/Helmet'
import RequiredLogin from '../../libs/RequiredLogin'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardPrintLayout: React.FC<Props> = (props) => {
  return (
    <PrintContainer>
      <RequiredLogin />
      <HeadHelper title={props.title} />
      {props.children}
    </PrintContainer>
  )
}

export default DashboardPrintLayout

const PrintContainer = styled.div`
  @page {
    size: A4 landscape;
    margin: 5mm;
    padding: 0;
  }
`
