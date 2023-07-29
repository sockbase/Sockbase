import styled from 'styled-components'
import { useMemo } from 'react'
import { type SockbaseTicketUserDocument, type SockbaseStore } from 'sockbase'
import HeadHelper from '../../../libs/Helmet'

interface Props {
  children: React.ReactNode
  ticketUser: SockbaseTicketUserDocument | null | undefined
  store: SockbaseStore | undefined
}
const TicketLayout: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const typeId = props.ticketUser.typeId
    const type = props.store.types
      .filter(t => t.id === typeId)[0]
    return type.name
  }, [props.ticketUser, props.store])

  const pageTitle = useMemo(() => {
    if (!props.ticketUser || !props.store) return '読み込み中'
    return `${props.store.storeName}(${typeName})`

  }, [props.ticketUser, props.store])

  return (
    <TicketLayoutContainer>
      <HeadHelper title={pageTitle} />
      {props.children}
    </TicketLayoutContainer>
  )
}

export default TicketLayout

const TicketLayoutContainer = styled.main`
  height: 100vh;
  height: 100dvh;
`
