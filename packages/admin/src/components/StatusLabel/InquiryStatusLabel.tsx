import { useMemo } from 'react'
import { MdCheck, MdCircle, MdOutlineQuestionMark, MdPendingActions } from 'react-icons/md'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'
import type { SockbaseInquiryStatus } from 'sockbase'

interface Props {
  status: SockbaseInquiryStatus | undefined
  isOnlyIcon?: boolean
}

const InquiryStatusLabel: React.FC<Props> = (props) => {
  const labelText = useMemo(() => {
    switch (props.status) {
      case 0:
        return 'オープン'
      case 1:
        return '対応中'
      case 2:
        return 'クローズ'
      default:
        return '状態不明'
    }
  }, [props.status])

  const iconElement = useMemo(() => {
    switch (props.status) {
      case 0:
        return <MdCircle />
      case 1:
        return <MdPendingActions />
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

export default InquiryStatusLabel

const Container = styled.label<{ status: SockbaseInquiryStatus | undefined }>`
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
          border: '1px solid var(--info-color)'
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
