import { useMemo } from 'react'
import { MdCheck, MdClose, MdOutlinePendingActions, MdUndo } from 'react-icons/md'
import styled from 'styled-components'
import IconLabel from '../IconLabel'
import type { PaymentStatus, SockbasePaymentDocument } from 'sockbase'

interface Props {
  payment: SockbasePaymentDocument
  isLink?: boolean
}
const PaymentStatusLabel: React.FC<Props> = (props) => {
  const statusTextLabel = useMemo(() => {
    const paymentMethod = props.payment.paymentMethod === 1
      ? 'オンライン決済'
      : props.payment.paymentMethod === 2
        ? '銀行振込'
        : '-'
    switch (props.payment.status) {
      case 0:
        return <IconLabel label={`お支払い待ち（${paymentMethod}）`} icon={<MdOutlinePendingActions />} />

      case 1:
        return <IconLabel label={`お支払い済み（${paymentMethod}）`} icon={<MdCheck />} />

      case 2:
        return <IconLabel label={`返金済み（${paymentMethod}）`} icon={<MdUndo />} />

      case 3:
        return <IconLabel label={`お支払い失敗（${paymentMethod}）`} icon={<MdClose />} />

      case 4:
        return <IconLabel label={`キャンセル済み（${paymentMethod}）`} icon={<MdClose />} />
    }
  }, [props.payment])

  return (
    <Container status={props.payment.status ?? 0} isLink={props.isLink}>
      {statusTextLabel}
    </Container>
  )
}

export default PaymentStatusLabel

const Container = styled.label<{ status: PaymentStatus, isLink?: boolean }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  color: var(--white-color);

  ${p => {
    if (p.status === 0) {
      return 'background-color: var(--pending-color);'
    } else if (p.status === 1) {
      return 'background-color: var(--success-color);'
    } else if (p.status === 2 || p.status === 3 || p.status === 4) {
      return 'background-color: var(--danger-color);'
    }
  }};
  
  ${p => p.isLink && 'cursor: pointer;'}
`
