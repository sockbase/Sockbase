import { useMemo } from 'react'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import type { SockbaseStoreDocument } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument | undefined
  typeId: string | undefined
}

const TicketTypeLabel: React.FC<Props> = (props) => {
  const ticketType = useMemo(() => {
    return props.store?.types.find(t => t.id === props.typeId)
  }, [props.store, props.typeId])

  return (
    ticketType !== undefined
      ? (
        <Container color={ticketType.color}>
          {ticketType?.name}
        </Container>
      )
      : (
        <BlinkField />
      )
  )
}

export default TicketTypeLabel

const Container = styled.label<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid ${props => props.color};
`
