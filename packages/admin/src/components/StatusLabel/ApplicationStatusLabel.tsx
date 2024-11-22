import { useMemo } from 'react'
import { MdCheck, MdClose, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'
import type { SockbaseApplicationStatus } from 'sockbase'

interface Props {
  status: SockbaseApplicationStatus | undefined
  isOnlyIcon?: boolean
}

const ApplicationStatusLabel: React.FC<Props> = (props) => {
  const labelText = useMemo(() => {
    switch (props.status) {
      case 0:
        return '確認待ち'
      case 1:
        return 'キャンセル'
      case 2:
        return '確定'
      default:
        return '状態不明'
    }
  }, [props.status])

  const iconElement = useMemo(() => {
    switch (props.status) {
      case 0:
        return <MdPendingActions />
      case 1:
        return <MdClose />
      case 2:
        return <MdCheck />
      default:
        return <MdOutlineQuestionMark />
    }
  }, [props.status])

  return (
    props.status !== undefined
      ? (
        <Container status={props.status}>
          <IconLabel
            icon={iconElement}
            label={labelText}
            isOnlyIcon={props.isOnlyIcon} />
        </Container>
      )
      : (
        <BlinkField />
      )
  )
}

export default ApplicationStatusLabel

const Container = styled.label<{ status: SockbaseApplicationStatus | undefined }>`
  display: inline-block;
  padding: 2px 4px;
  border-radius: 5px;
  background-color: var(--inputfield-background-color);
  ${props => {
    switch (props.status) {
      case 0:
        return {
          border: '1px solid var(--warning-color)'
        }
      case 1:
        return {
          border: '1px solid var(--danger-color)'
        }
      case 2:
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
