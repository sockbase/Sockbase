import { useMemo } from 'react'
import { MdCheck, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import IconLabel from '../IconLabel'

interface Props {
  status: boolean | undefined
}
const TicketUsedStatusLabel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (props.status) {
      return <IconLabel label="使用済み" icon={<MdCheck />} />
    } else {
      return <IconLabel label="未使用" icon={<MdPendingActions />} />
    }
  }, [props.status])

  return (
    <Container status={props.status ?? false}>
      {typeName}
    </Container>
  )
}

export default TicketUsedStatusLabel

const Container = styled.label<{ status: boolean }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  ${p => {
    if (p.status) {
      return 'background-color: var(--danger-color);'
    } else {
      return 'background-color: var(--pending-color);'
    }
  }};

  color: var(--text-foreground-color);
`
