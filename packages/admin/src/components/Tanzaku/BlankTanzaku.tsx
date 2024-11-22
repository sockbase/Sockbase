import styled from 'styled-components'
import useDayjs from '../../hooks/useDayjs'
import A5Page from '../Print/A5Page'
import PrintContainer from '../Print/PrintContainer'
import PrintPlaceHolderField from '../Print/PrintPlaceHolderField'
import type { SockbaseEventDocument } from 'sockbase'

interface Props {
  now: Date
  event: SockbaseEventDocument
  blankIndex: number
  blankTanzakuCount: number
}
const BlankTanzaku: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  return (
    <A5Page>
      <PrintContainer>
        <Header>
          <OrganizationName>{props.event._organization.name}</OrganizationName>
          <EventName>
            {props.event.name} 準備会スペース用短冊 #{props.blankIndex + 1}
          </EventName>
        </Header>
        <Main>
          <Blank>
            #{props.blankIndex + 1}
          </Blank>
        </Main>
        <Footer>
          準備会: {props.blankIndex + 1} / {props.blankTanzakuCount}<br />
          {formatByDate(props.now, 'YYYY/MM/DD HH:mm:ss')}
        </Footer>
      </PrintContainer>
    </A5Page>
  )
}

export default BlankTanzaku

const Header = styled.div`
  margin-bottom: 2mm;
`
const OrganizationName = styled.div``
const EventName = styled.div`
  font-size: 2em;
  font-weight: bold;
`
const Main = styled.div``
const Blank = styled(PrintPlaceHolderField)`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50mm;
  font-weight: bold;
  color: #f0f0f0;
`
const Footer = styled.div`
  text-align: right;
`
