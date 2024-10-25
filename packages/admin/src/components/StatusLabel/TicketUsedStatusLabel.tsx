import { useMemo } from 'react'
import { MdCheck, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'

interface Props {
  used: boolean | undefined
}

const TicketUsedStatusLabel: React.FC<Props> = (props) => {
  const labelText = useMemo(() => {
    switch (props.used) {
      case false:
        return '未使用'
      case true:
        return '使用済み'
      default:
        return '状態不明'
    }
  }, [props.used])

  const iconElement = useMemo(() => {
    switch (props.used) {
      case false:
        return <MdPendingActions />
      case true:
        return <MdCheck />
      default:
        return <MdOutlineQuestionMark />
    }
  }, [props.used])

  return (
    props.used !== undefined
      ? (
        <Container used={props.used}>
          <IconLabel icon={iconElement} label={labelText} />
        </Container>
      )
      : (
        <BlinkField />
      )
  )
}

export default TicketUsedStatusLabel

const Container = styled.label<{ used: boolean | undefined }>`
  display: inline-block;
  padding: 2px 4px;
  border-radius: 5px;
  ${props => {
    switch (props.used) {
      case false:
        return {
          border: '1px solid var(--pending-color)'
        }
      case true:
        return {
          border: '1px solid var(--danger-color)'
        }
      default:
        return {
          border: '1px solid #777'
        }
    }
  }}
`
