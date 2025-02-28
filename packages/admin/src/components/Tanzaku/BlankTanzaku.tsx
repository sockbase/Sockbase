import styled from 'styled-components'
import useDayjs from '../../hooks/useDayjs'
import A5Page from '../Print/A5Page'
import PrintContainer from '../Print/PrintContainer'
import PrintPlaceHolderField from '../Print/PrintPlaceHolderField'
import PrintSection from '../Print/PrintSection'
import PrintTable from '../Print/PrintTable'
import TwoColumnLayout from '../Print/TwoColumnLayout'
import type { SockbaseEventDocument } from 'sockbase'

interface Props {
  now: Date
  event: SockbaseEventDocument
  blankIndex: number
  blankTanzakuCount: number
}
const BlankTanzaku: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()
  return (
    <A5Page>
      <PrintContainer>
        <Header>
          {props.event._organization.name} {props.event.name} 準備会スペース用短冊 #{props.blankIndex + 1}
        </Header>
        <Main>
          <TwoColumnLayout>
            <></>
            <>
              <PrintSection>
                <PrintTable>
                  <tbody>
                    <tr>
                      <td style={{ height: '15mm' }}>ブロック</td>
                      <td style={{ height: '15mm' }}>スペース</td>
                      <td style={{ height: '15mm' }}>a/b</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
          </TwoColumnLayout>
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
`
const Main = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
`
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
