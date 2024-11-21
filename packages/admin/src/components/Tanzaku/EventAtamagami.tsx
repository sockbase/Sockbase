import styled from 'styled-components'
import useDayjs from '../../hooks/useDayjs'
import B5Page from '../Print/A5Page'
import PrintBlankBar from '../Print/PrintBlankBar'
import PrintContainer from '../Print/PrintContainer'
import PrintMainContent from '../Print/PrintMainContent'
import PrintPlaceHolderField from '../Print/PrintPlaceHolderField'
import PrintSection from '../Print/PrintSection'
import PrintSectionTitle from '../Print/PrintSectionTitle'
import PrintTable from '../Print/PrintTable'
import type { SockbaseEventDocument } from 'sockbase'

interface Props {
  now: Date
  event: SockbaseEventDocument
  confirmedAppCount: number
  totalSpaceCount: number
  hasAdultAppCount: number
  petitOnlyAppCount: number
  unionAppCount: number
}
const EventAtamagami: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <B5Page>
      <PrintContainer>
        <Header>
          <OrganizationName>{props.event._organization.name}</OrganizationName>
          <EventName>
            {props.event.name} 配置用短冊
          </EventName>
        </Header>
        <Main>
          <PrintMainContent>
            <PrintSection>
              <PrintSectionTitle>1. 配置情報</PrintSectionTitle>
              <PrintTable>
                <tbody>
                  <tr>
                    <th>申込確定サークル</th>
                    <td>{props.confirmedAppCount} サークル</td>
                  </tr>
                  <tr>
                    <th>要配置総スペース</th>
                    <td>{props.totalSpaceCount} スペース</td>
                  </tr>
                  <tr>
                    <th>成人向けサークル</th>
                    <td>{props.hasAdultAppCount} サークル</td>
                  </tr>
                  <tr>
                    <th>プチオンリー申込</th>
                    <td>{props.petitOnlyAppCount} サークル</td>
                  </tr>
                  <tr>
                    <th>隣接希望サークル</th>
                    <td>{props.unionAppCount} サークル</td>
                  </tr>
                </tbody>
              </PrintTable>
            </PrintSection>
            <PrintSection>
              <PrintSectionTitle>2. 特殊対応メモ</PrintSectionTitle>
              <PrintPlaceHolderField style={{ height: '100mm' }} />
            </PrintSection>
          </PrintMainContent>
          <PrintBlankBar />
        </Main>
        <Footer>
          イベント頭紙<br />
          {formatByDate(props.now, 'YYYY/MM/DD HH:mm:ss')}
        </Footer>
      </PrintContainer>
    </B5Page>
  )
}

export default EventAtamagami

const Header = styled.div`
  margin-bottom: 2mm;
`
const OrganizationName = styled.div``
const EventName = styled.div`
  margin-top: -1mm;
  font-size: 7mm;
  font-weight: bold;
`
const Main = styled.div``
const Footer = styled.div`
  text-align: right;
`
