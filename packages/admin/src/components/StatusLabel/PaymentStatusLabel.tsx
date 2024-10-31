import { useMemo } from 'react'
import { MdCheck, MdClose, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'
import type { PaymentStatus } from 'sockbase'

interface Props {
  status: PaymentStatus | undefined
  isOnlyIcon?: boolean
}

const PaymentStatusLabel: React.FC<Props> = (props) => {
  const labelText = useMemo(() => {
    switch (props.status) {
      case 0:
        return '支払待'
      case 1:
        return '支払済'
      case 2:
        return '返金'
      case 3:
        return 'エラー'
      case 4:
        return 'キャンセル'
      default:
        return '状態不明'
    }
  }, [props.status])

  const iconElement = useMemo(() => {
    switch (props.status) {
      case 0:
        return <MdPendingActions />
      case 1:
        return <MdCheck />
      case 2:
        return <MdClose />
      case 3:
        return <MdClose />
      case 4:
        return <MdClose />
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

export default PaymentStatusLabel

const Container = styled.label<{ status: PaymentStatus | undefined }>`
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
          border: '1px solid var(--success-color)'
        }
      case 2:
      case 3:
      case 4:
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
