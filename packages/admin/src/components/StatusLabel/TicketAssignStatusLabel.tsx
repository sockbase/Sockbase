import { useMemo } from 'react'
import { MdCheck, MdHowToReg, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'
import type { SockbaseTicketUserDocument } from 'packages/types/src'

interface Props {
  ticketUser: SockbaseTicketUserDocument | undefined
  isOnlyIcon?: boolean
}

const TicketAssignStatusLabel: React.FC<Props> = props => {
  const labelText = useMemo(() => {
    switch (props.ticketUser?.isStandalone) {
      case true:
        return 'スタンドアロン'
    }
    switch (props.ticketUser?.usableUserId) {
      case undefined:
        return '状態不明'
      case null:
        return '未割当'
      default:
        return '割当済み'
    }
  }, [props.ticketUser])

  const iconElement = useMemo(() => {
    switch (props.ticketUser?.isStandalone) {
      case true:
        return <MdHowToReg />
    }
    switch (props.ticketUser?.usableUserId) {
      case undefined:
        return <MdOutlineQuestionMark />
      case null:
        return <MdPendingActions />
      default:
        return <MdCheck />
    }
  }, [props.ticketUser])

  const assigned = useMemo(() => {
    if (!props.ticketUser) return undefined
    return props.ticketUser.usableUserId !== null || props.ticketUser.isStandalone
  }, [props.ticketUser])

  return (
    props.ticketUser
      ? (
        <Container assigned={assigned}>
          <IconLabel
            icon={iconElement}
            isOnlyIcon={props.isOnlyIcon}
            label={labelText} />
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
  background-color: var(--inputfield-background-color);
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
