import { useMemo } from 'react'
import { MdCheck, MdClose, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import { type SockbaseApplicationStatus } from 'sockbase'
import IconLabel from '../IconLabel'

interface Props {
  status: SockbaseApplicationStatus | undefined
}
const ApplicationStatusLabel: React.FC<Props> = props => {
  const typeLabel = useMemo(() => {
    if (props.status === 0) {
      return (
        <IconLabel
          icon={<MdPendingActions />}
          label="仮申し込み" />
      )
    }
    else if (props.status === 1) {
      return (
        <IconLabel
          icon={<MdClose />}
          label="キャンセル済み" />
      )
    }
    else if (props.status === 2) {
      return (
        <IconLabel
          icon={<MdCheck />}
          label="確定" />
      )
    }
  }, [props.status])

  return (
    <Container status={props.status ?? 0}>
      {typeLabel}
    </Container>
  )
}

export default ApplicationStatusLabel

const Container = styled.label<{ status: SockbaseApplicationStatus }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  color: var(--white-color);
  
  ${p => {
    if (p.status === 0) {
      return 'background-color: var(--pending-color);'
    }
    else if (p.status === 1) {
      return 'background-color: var(--danger-color);'
    }
    else if (p.status === 2) {
      return 'background-color: var(--success-color);'
    }
  }};
`
