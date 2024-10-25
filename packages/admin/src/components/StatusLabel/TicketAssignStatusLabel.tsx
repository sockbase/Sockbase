import { useMemo } from 'react'
import { MdCheck, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'

interface Props {
  usableUserId: string | null | undefined
}

const TicketAssignStatusLabel: React.FC<Props> = (props) => {
  const labelText = useMemo(() => {
    switch (props.usableUserId) {
      case undefined:
        return '状態不明'
      case null:
        return '未割当'
      default:
        return '割当済み'
    }
  }, [props.usableUserId])

  const iconElement = useMemo(() => {
    switch (props.usableUserId) {
      case undefined:
        return <MdOutlineQuestionMark />
      case null:
        return <MdPendingActions />
      default:
        return <MdCheck />
    }
  }, [props.usableUserId])

  return (
    props.usableUserId !== undefined
      ? (
        <Container assigned={props.usableUserId === undefined ? undefined : !!props.usableUserId}>
          <IconLabel icon={iconElement} label={labelText} />
        </Container>
      )
      : (
        <BlinkField />
      )
  )
}

export default TicketAssignStatusLabel

const Container = styled.label<{ assigned: boolean | undefined }>`
  display: inline-block;
  padding: 2px 4px;
  border-radius: 5px;
  ${props => {
    switch (props.assigned) {
      case false:
        return {
          border: '1px solid var(--pending-color)'
        }
      case true:
        return {
          border: '1px solid var(--success-color)'
        }
      default:
        return {
          border: '1px solid #777'
        }
    }
  }}
`
