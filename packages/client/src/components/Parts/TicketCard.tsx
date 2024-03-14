import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  type SockbaseStoreDocument,
  type SockbaseStoreType,
  type SockbaseTicketUserDocument
} from 'sockbase'
import useDayjs from '../../hooks/useDayjs'

interface Props {
  ticketUser: SockbaseTicketUserDocument
  store: SockbaseStoreDocument | undefined
  type: SockbaseStoreType | undefined
}
const TicketCard: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <Container key={props.ticketUser.hashId} to={`/dashboard/mytickets/${props.ticketUser.hashId}`}>
      <Header color={props.ticketUser.used ? 'var(--pending-color)' : props.type?.color ?? 'var(--background-disabled-color)'}>
        {props.store?.storeName}
      </Header>
      <Content>
        <ContentTitle>チケット種別</ContentTitle>
        <ContentBody>{props.type?.name}</ContentBody>
      </Content>
      <Footer>
        <UsedStatus>
          {props.ticketUser.used
            ? `${formatByDate(props.ticketUser.usedAt, 'YYYY年M月D日')} 使用済`
            : '未使用'}
        </UsedStatus>
        <TicketId>
          {props.ticketUser.hashId}
        </TicketId>
      </Footer>
    </Container>
  )
}

export default TicketCard

const Container = styled(Link)`
  &:hover {
    text-decoration: none;
  }
`
const Header = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  color: var(--text-foreground-color);
  padding: 10px;
  border-radius: 5px 5px 0 0;
`
const Content = styled.div`
  background-color: var(--background-light-color);
  color: var(--text-color);
  padding: 10px;
`
const Footer = styled.div`
  color: initial;
  padding: 10px;
  background-color: var(--background-dark-color);
  border-bottom: 2px solid var(--shadow-color);
  border-radius: 0 0 5px 5px;
`
const UsedStatus = styled.div`
  color: var(--text-color);
`
const TicketId = styled.div`
  font-size: 0.75em;
  word-break: break-all;
  color: var(--text-light-color);
`
const ContentTitle = styled.div`
  margin-bottom: 1px;
  &:last-child {
    margin-bottom: 0;
  }
  color: var(--text-light-color);
  font-size: 0.9em;
`
const ContentBody = styled.p`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`
