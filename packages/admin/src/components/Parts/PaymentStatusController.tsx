import { useCallback } from 'react'
import { MdCheck, MdOutlinePayments, MdCancel } from 'react-icons/md'
import usePayment from '../../hooks/usePayment'
import FormButton from '../Form/FormButton'
import FormItem from '../Form/FormItem'
import FormSection from '../Form/FormSection'
import Alert from './Alert'
import BlinkField from './BlinkField'
import IconLabel from './IconLabel'
import type { PaymentStatus } from 'sockbase'

interface Props {
  paymentId: string | null | undefined
  status: PaymentStatus | undefined
  onChange: (status: PaymentStatus) => void
}
const PaymentStatusController: React.FC<Props> = props => {
  const { setPaymentStatusAsync } = usePayment()

  const handleSetPaymentStatus = useCallback((status: PaymentStatus) => {
    if (!props.paymentId) return
    if (!confirm('支払いステータスを変更します。\nよろしいですか？')) return
    setPaymentStatusAsync(props.paymentId, status)
      .then(() => props.onChange(status))
      .catch(err => { throw err })
  }, [props.paymentId])

  return (
    <>
      <h3>決済ステータス変更</h3>
      {props.paymentId === undefined
        ? (
          <BlinkField />
        )
        : props.paymentId === null
          ? (
            <Alert
              title="決済情報がないためステータスを変更できません。"
              type="warning" />
          )
          : props.status === 0
            ? (
              <FormSection>
                <FormItem $inlined>
                  <FormButton onClick={() => handleSetPaymentStatus(1)}>
                    <IconLabel
                      icon={<MdCheck />}
                      label="支払い済みにする" />
                  </FormButton>
                  <FormButton onClick={() => handleSetPaymentStatus(2)}>
                    <IconLabel
                      icon={<MdOutlinePayments />}
                      label="返金済みにする" />
                  </FormButton>
                  <FormButton onClick={() => handleSetPaymentStatus(4)}>
                    <IconLabel
                      icon={<MdCancel />}
                      label="キャンセルにする" />
                  </FormButton>
                </FormItem>
              </FormSection>
            )
            : (
              <Alert
                title="決済ステータスの変更がロックされています。Sockbase 管理者へお問い合わせください。"
                type="warning" />
            )}
      <Alert
        title="決済ステータスは一度変更すると変更できません。"
        type="info" />
    </>
  )
}

export default PaymentStatusController
