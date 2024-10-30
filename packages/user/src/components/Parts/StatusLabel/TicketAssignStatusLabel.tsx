import { useMemo } from 'react'
import { MdCheck, MdWarningAmber } from 'react-icons/md'
import styled from 'styled-components'
import IconLabel from '../IconLabel'

interface Props {
  status: boolean | undefined
}
const TicketAssignStatusLabel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (props.status) {
      return <IconLabel label="割当済み" icon={<MdCheck />} />
    } else {
      return <IconLabel label="未割当" icon={<MdWarningAmber />} />
    }
  }, [props.status])

  return (
    <Container status={props.status ?? false}>
      {typeName}
    </Container>
  )
}

export default TicketAssignStatusLabel

const Container = styled.label<{ status: boolean }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  color: var(--white-color);

  ${p => {
    if (p.status) {
      return 'background-color: var(--success-color);'
    } else {
      return 'background-color: var(--danger-color);'
    }
  }};
`
