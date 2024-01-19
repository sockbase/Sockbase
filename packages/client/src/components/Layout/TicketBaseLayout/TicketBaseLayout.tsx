import { useMemo } from 'react'
import styled from 'styled-components'
import { type SockbaseTicketUserDocument, type SockbaseStore } from 'sockbase'
import HeadHelper from '../../../libs/Helmet'
import RequiredLogin from '../../../libs/RequiredLogin'

interface Props {
  children: React.ReactNode
  ticketUser: SockbaseTicketUserDocument | null | undefined
  store: SockbaseStore | undefined
}
const TicketBaseLayout: React.FC<Props> = (props) => {
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
    <TicketBaseLayoutContainer>
      <RequiredLogin />
      <HeadHelper title={pageTitle} />
      {props.children}
    </TicketBaseLayoutContainer>
  )
}

export default TicketBaseLayout

const TicketBaseLayoutContainer = styled.main`
  height: 100vh;
  height: 100dvh;
`
