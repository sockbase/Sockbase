import { useMemo } from 'react'
import { MdCheck, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'

interface Props {
  isStandalone: boolean | undefined
  usableUserId: string | null | undefined
  isOnlyIcon?: boolean
}

const TicketAssignStatusLabel: React.FC<Props> = props => {
  const labelText = useMemo(() => {
    switch (props.isStandalone) {
      case true:
        return 'スタンドアロン'
    }
    switch (props.usableUserId) {
      case undefined:
        return '状態不明'
      case null:
        return '未割当'
      default:
        return '割当済み'
    }
  }, [props.isStandalone, props.usableUserId])

  const iconElement = useMemo(() => {
    switch (props.isStandalone) {
      case true:
        return <MdCheck />
    }
    switch (props.usableUserId) {
      case undefined:
        return <MdOutlineQuestionMark />
      case null:
        return <MdPendingActions />
      default:
        return <MdCheck />
    }
  }, [props.usableUserId, props.isStandalone])

  const assigned = useMemo(() => {
    if (props.usableUserId === undefined && props.isStandalone === undefined) return undefined
    return props.usableUserId !== null || props.isStandalone
  }, [props.usableUserId, props.isStandalone])

  return (
    props.usableUserId !== undefined || props.isStandalone !== undefined
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
