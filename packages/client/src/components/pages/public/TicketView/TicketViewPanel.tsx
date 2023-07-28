import styled from 'styled-components'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import ReactQRCode from 'react-qr-code'
import { useMemo } from 'react'

interface Props {
  ticketUser: SockbaseTicketUserDocument
  store: SockbaseStoreDocument
}
const TicketViewPanel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (!props.ticketUser || !props.store) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.ticketUser, props.store])

  return (
    <Container>
      <TicketContainer>
        <TitleContainer>
          <StoreName>{props.store.storeName}</StoreName>
          <TypeName>{typeName}</TypeName>
          <QRCodeArea>
            <QRCode value="unchi" size={192} />
          </QRCodeArea>
        </TitleContainer>
        <ContentContainer>
          <p>
            上のQRコードを入口スタッフまでご提示ください。
          </p>
          <p>
            QRコードを提示できない場合は、この画面を印刷しご持参ください。
          </p>
        </ContentContainer>
      </TicketContainer>
    </Container>
  )
}

export default TicketViewPanel

const Container = styled.div`
  height: 100%;
  padding: 40px 25%;
  background-color: #f0f0f0;

  @media screen and (max-width: 840px) {
    padding: 0;
  }
`
const TicketContainer = styled.div`
  max-width: 840px;
`
const TitleContainer = styled.section<{ color?: string }>`
  padding: 20px;
  background-color: ${props => props.color ?? '#c0c0c0'};
  text-align: center;
`
const StoreName = styled.div``
const TypeName = styled.div`
  font-size: 1.5em;
  font-weight: bold;
`
const QRCodeArea = styled.section`
  margin-top: 20px;
`
const QRCode = styled(ReactQRCode)`
  padding: 20px;
  background-color: #ffffff;
`
const ContentContainer = styled.section`
  padding: 20px;
  background-color:#ffffff;
  border-bottom: 10px solid var(--primary-color);
`
