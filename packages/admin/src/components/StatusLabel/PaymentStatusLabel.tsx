import { useMemo } from 'react'
import { MdCheck, MdClose, MdCreditCard, MdLocalActivity, MdOutlineQuestionMark, MdPayments, MdPendingActions } from 'react-icons/md'
import { SiAmericanexpress, SiJcb, SiMastercard, SiVisa } from 'react-icons/si'
import styled from 'styled-components'
import BlinkField from '../Parts/BlinkField'
import IconLabel from '../Parts/IconLabel'
import type { PaymentStatus, SockbasePaymentDocument } from 'sockbase'

interface Props {
  payment: SockbasePaymentDocument | null | undefined
  isShowBrand?: boolean
  isOnlyIcon?: boolean
}

const PaymentStatusLabel: React.FC<Props> = props => {
  const labelText = useMemo(() => {
    switch (props.payment?.status) {
      case 0:
        return '支払待ち'
      case 1:
        return '支払済み'
      case 2:
        return '返金済み'
      case 3:
        return 'エラー'
      case 4:
        return 'キャンセル'
      default:
        return '状態不明'
    }
  }, [props.payment])

  const iconElement = useMemo(() => {
    switch (props.payment?.status) {
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
  }, [props.payment])

  const icon2Element = useMemo(() => {
    if (!props.isShowBrand) return
    if (props.payment?.cardBrand) {
      switch (props.payment.cardBrand) {
        case 'visa':
          return <SiVisa />
        case 'mastercard':
          return <SiMastercard />
        case 'jcb':
          return <SiJcb />
        case 'amex':
          return <SiAmericanexpress />
        default:
          return <MdCreditCard />
      }
    }
    else {
      switch (props.payment?.paymentMethod) {
        case 1:
          return <MdCreditCard />
        case 2:
          return <MdPayments />
        case 3:
          return <MdLocalActivity />
        default:
          return <MdOutlineQuestionMark />
      }
    }
  }, [props.payment])

  return (
    props.payment !== null
      ? props.payment?.status !== undefined
        ? (
          <Container status={props.payment.status}>
            <IconLabel
              icon={iconElement}
              icon2={icon2Element}
              isOnlyIcon={props.isOnlyIcon}
              label={labelText} />
          </Container>
        )
        : (
          <BlinkField />
        )
      : '不要'
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
