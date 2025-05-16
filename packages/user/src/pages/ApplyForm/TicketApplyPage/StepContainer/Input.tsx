import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdArrowBack, MdArrowForward, MdCheck } from 'react-icons/md'
import sockbaseShared from 'shared'
import FormButton from '../../../../components/Form/FormButton'
import FormCheckbox from '../../../../components/Form/FormCheckbox'
import FormInput from '../../../../components/Form/FormInput'
import FormItem from '../../../../components/Form/FormItem'
import FormLabel from '../../../../components/Form/FormLabel'
import FormRadio from '../../../../components/Form/FormRadio'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import UserDataForm from '../../../../components/UserDataForm'
import useValidate from '../../../../hooks/useValidate'
import useVoucher from '../../../../hooks/useVoucher'
import AmountCalculator from '../../CircleApplyPage/StepContainer/AmountCalculator'
import type {
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseStoreDocument,
  SockbaseTicket,
  SockbaseVoucherCodeDocument,
  SockbaseVoucherDocument
} from 'sockbase'

const ticketUsers = [
  { text: '自分で使用する', value: 'myself' },
  { text: '他の方が使用する (チケットを譲渡する)', value: 'anyself' }
]

interface Props {
  store: SockbaseStoreDocument
  ticket: SockbaseTicket | undefined
  useMySelf: boolean | undefined
  userData: SockbaseAccountSecure | undefined
  fetchedUserData: SockbaseAccount | null | undefined
  voucher: SockbaseVoucherDocument | null | undefined
  voucherCode: SockbaseVoucherCodeDocument | null | undefined
  inputtedVoucherCode: string
  getVoucherByCodeAsync: (typeId: string, code: string) => Promise<void>
  resetVoucher: () => void
  prevStep: () => void
  nextStep: (
    ticket: SockbaseTicket,
    useMySelf: boolean,
    userData: SockbaseAccountSecure | undefined,
    voucherCode: string
  ) => void
}
const Input: React.FC<Props> = props => {
  const validator = useValidate()
  const { calculatePaymentAmount } = useVoucher()

  const initialTicket = useMemo(() => ({
    storeId: props.store.id,
    typeId: '',
    paymentMethod: (!props.store.permissions.canUseBankTransfer && 'online') || ''
  }), [props.store])

  const [ticket, setTicket] = useState(initialTicket)
  const [ticketUser, setTicketUser] = useState('')
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const [isProcessVoucher, setIsProcessVoucher] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [isAgreed, setAgreed] = useState(false)

  const typeIds = useMemo(() => {
    return props.store.types.map(t => t.id)
  }, [props.store])

  const usablePaymentMethods = useMemo(() => sockbaseShared.constants.payment.methods
    .filter(m => m.id !== 'voucher')
    .filter(m => m.id !== 'bankTransfer' || props.store.permissions.canUseBankTransfer)
    .map(i => ({
      text: i.description,
      value: i.id
    })), [props.store])
  const paymentMethodIds = useMemo(() => usablePaymentMethods.map(p => p.value), [usablePaymentMethods])

  const selectedType = useMemo(() => {
    if (!ticket.typeId) return
    return props.store.types.find(t => t.id === ticket.typeId)
  }, [props.store, ticket])

  const paymentAmount = useMemo(() => {
    if (!selectedType) return
    return calculatePaymentAmount(selectedType.price, props.voucher?.amount)
  }, [selectedType, props.voucher])

  const errorCount = useMemo(() => {
    const validators = [
      validator.isIn(ticket.typeId, typeIds),
      validator.isIn(ticketUser, ['myself', 'anyself']),
      !selectedType?.price || paymentAmount?.paymentAmount === 0 || validator.isIn(ticket.paymentMethod, paymentMethodIds),
      isAgreed
    ]

    let errorCount = validators.filter(v => !v).length
    if (props.fetchedUserData) {
      const additionalUserDataValidators = [
        props.fetchedUserData.gender || validator.isIn(userData?.gender?.toString() ?? '', ['1', '2'])
      ]
      errorCount += additionalUserDataValidators.filter(v => !v).length
    }
    else {
      if (!userData) return 1
      const userDataValidators = [
        validator.isNotEmpty(userData.name),
        validator.isPostalCode(userData.postalCode),
        validator.isEmail(userData.email),
        validator.isStrongPassword(userData.password),
        validator.isNotEmpty(userData.rePassword),
        validator.isIn(userData.gender?.toString() ?? '', ['1', '2']),
        validator.equals(userData.password, userData.rePassword)
      ]
      errorCount += userDataValidators.filter(v => !v).length
    }
    return errorCount
  }, [props.fetchedUserData, isAgreed, ticket, ticketUser, typeIds, selectedType, userData, paymentAmount, paymentMethodIds])

  const handleGetVoucher = useCallback(async () => {
    if (!selectedType || !voucherCode) return
    setIsProcessVoucher(true)
    props.getVoucherByCodeAsync(selectedType.id, voucherCode)
      .finally(() => setIsProcessVoucher(false))
  }, [selectedType, voucherCode, props.getVoucherByCodeAsync])

  const handleChangeSpaceType = useCallback((typeId: string) => {
    if (props.voucher) {
      if (!confirm('チケット種別を変更するとバウチャーがリセットされます。\nチケット種別を変更してもよろしいですか？')) {
        return false
      }
      props.resetVoucher()
      setVoucherCode('')
    }
    setTicket(s => ({ ...s, typeId }))
    return true
  }, [props.voucher])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0 || !paymentAmount) return

    const sanitizedTicket = {
      ...ticket,
      paymentMethod: paymentAmount.paymentAmount === 0 ? 'voucher' : ticket.paymentMethod
    }

    props.nextStep(sanitizedTicket, ticketUser === 'myself', userData, voucherCode)
  }, [errorCount, ticket, ticketUser, userData, voucherCode, paymentAmount])

  useEffect(() => {
    if (props.ticket) {
      setTicket({
        ...props.ticket,
        paymentMethod: (!props.store.permissions.canUseBankTransfer && 'online') || props.ticket.paymentMethod
      })
    }
    setTicketUser(props.useMySelf === undefined
      ? ''
      : props.useMySelf
        ? 'myself'
        : 'anyself')
    if (props.userData) {
      setUserData(props.userData)
    }
    if (props.inputtedVoucherCode) {
      setVoucherCode(props.inputtedVoucherCode)
    }
  }, [props.ticket, props.useMySelf, props.userData, props.inputtedVoucherCode])

  useEffect(() => {
    if (props.voucherCode === null) return
    if (voucherCode === props.voucherCode?.id) return
    props.resetVoucher()
  }, [voucherCode, props.voucherCode])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton onClick={props.prevStep}>
            <IconLabel
              icon={<MdArrowBack />}
              label="申し込み説明画面へ戻る" />
          </FormButton>
        </FormItem>
      </FormSection>

      <h2>申し込むチケット種別</h2>
      <FormSection>
        <FormItem>
          <FormLabel>チケット種別</FormLabel>
          <FormRadio
            name="type"
            onChange={handleChangeSpaceType}
            value={ticket.typeId}
            values={
              props.store.types
                .filter(t => t.isPublic)
                .map(t => ({
                  text: `${t.name} ${t.price.toLocaleString()}円 / ${t.description}`,
                  value: t.id
                }))
            } />
        </FormItem>
      </FormSection>

      <h2>チケットの使用者</h2>
      <p>
        チケットの使用者を選択してください。<br />
        申し込み者とチケット使用者が異なる場合は「他の方が使用する (チケットを譲渡する)」を選択してください。
      </p>
      <FormSection>
        <FormItem>
          <FormRadio
            name="ticketUser"
            onChange={setTicketUser}
            value={ticketUser}
            values={ticketUsers} />
        </FormItem>
      </FormSection>

      <UserDataForm
        fetchedUserData={props.fetchedUserData}
        setUserData={u => setUserData(u)}
        userData={props.userData} />

      {selectedType && selectedType.price > 0 && (
        <>
          <h2>お支払い情報</h2>

          <h3>バウチャー利用</h3>
          <p>
            バウチャーをお持ちの場合は、バウチャーコードを入力してください。
          </p>
          <FormSection>
            <FormItem>
              <FormLabel>バウチャーコード</FormLabel>
              <FormInput
                onChange={e => setVoucherCode(e.target.value)}
                value={voucherCode} />
            </FormItem>
            <FormItem>
              <FormButton
                color="primary"
                disabled={isProcessVoucher || !selectedType || !voucherCode || !!props.voucher}
                onClick={handleGetVoucher}>
                <IconLabel
                  icon={<MdCheck />}
                  label="バウチャー反映" />
              </FormButton>
            </FormItem>
            <FormItem>
              {!selectedType && (
                <Alert
                  title="バウチャーを利用するには、チケット種別を選択する必要があります"
                  type="warning" />
              )}
              {props.voucher === undefined && !isProcessVoucher && selectedType && voucherCode && (
                <Alert
                  title="「バウチャー反映」を押してください"
                  type="info" />
              )}
              {props.voucher === null && (
                <Alert
                  title="このバウチャーは使用できません"
                  type="error" />
              )}
              {props.voucher && (
                <Alert
                  title="バウチャー利用額が反映されました"
                  type="success">
                バウチャーは申し込み情報の送信時に適用されます。<br />
                バウチャーを適用できなかった場合、エラーが発生します。
                </Alert>
              )}
            </FormItem>
          </FormSection>

          {paymentAmount && paymentAmount.paymentAmount > 0 && (
            <>
              <h3>お支払い方法</h3>
              <FormSection>
                <FormItem>
                  <FormRadio
                    name="paymentMethod"
                    onChange={paymentMethod => setTicket(s => ({ ...s, paymentMethod }))}
                    value={ticket.paymentMethod}
                    values={usablePaymentMethods} />
                </FormItem>
                {ticket.paymentMethod === 'bankTransfer' && (
                  <FormItem>
                    <Alert
                      title="銀行振込の場合、申し込み完了までお時間をいただくことがございます。"
                      type="warning" />
                  </FormItem>
                )}
              </FormSection>
            </>
          )}

          <h3>お支払い内容確認</h3>
          {!selectedType && (
            <Alert
              title="申し込みたいチケット種別を選択してください"
              type="warning" />
          )}
          <table>
            <tbody>
              <tr>
                <th>チケット種別</th>
                <td>{selectedType?.name ?? '---'}</td>
              </tr>
              <tr>
                <th>説明</th>
                <td>{selectedType?.description ?? '---'}</td>
              </tr>
              <AmountCalculator paymentAmount={paymentAmount} />
            </tbody>
          </table>
        </>
      )}

      <h2>注意事項</h2>
      <p>
        <a
          href="/tos"
          target="_blank">
          Sockbase 利用規約
        </a>
        および
        <a
          href="/privacy-policy"
          target="_blank">
          プライバシーポリシー
        </a>
        に同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={isAgreed}
            label="同意します"
            name="isAggreed"
            onChange={checked => setAgreed(checked)} />
        </FormItem>
      </FormSection>

      {errorCount > 0 && (
        <Alert
          title={`${errorCount} 個の入力項目に不備があります。`}
          type="error" />
      )}

      <FormSection>
        <FormButton
          color="primary"
          disabled={!isAgreed || errorCount > 0}
          onClick={handleSubmit}>
          <IconLabel
            icon={<MdArrowForward />}
            label="入力内容確認画面へ進む" />
        </FormButton>
      </FormSection>
    </>
  )
}

export default Input
