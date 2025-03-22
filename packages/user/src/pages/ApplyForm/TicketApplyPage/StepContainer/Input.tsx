import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import sockbaseShared from 'shared'
import FormButton from '../../../../components/Form/FormButton'
import FormCheckbox from '../../../../components/Form/FormCheckbox'
import FormItem from '../../../../components/Form/FormItem'
import FormLabel from '../../../../components/Form/FormLabel'
import FormRadio from '../../../../components/Form/FormRadio'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import UserDataForm from '../../../../components/UserDataForm'
import useValidate from '../../../../hooks/useValidate'
import type { SockbaseAccount, SockbaseAccountSecure, SockbaseStoreDocument, SockbaseTicket } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument
  ticket: SockbaseTicket | undefined
  userData: SockbaseAccountSecure | undefined
  fetchedUserData: SockbaseAccount | null | undefined
  prevStep: () => void
  nextStep: (ticket: SockbaseTicket, userData: SockbaseAccountSecure | undefined) => void
}
const Input: React.FC<Props> = props => {
  const validator = useValidate()

  const initialTicket = useMemo(() => ({
    storeId: props.store.id,
    typeId: '',
    paymentMethod: (!props.store.permissions.canUseBankTransfer && 'online') || ''
  }), [props.store])

  const [ticket, setTicket] = useState(initialTicket)
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const [isAgreed, setAgreed] = useState(false)

  const typeIds = useMemo(() => {
    return props.store.types.map(t => t.id)
  }, [props.store])

  const selectedType = useMemo(() => {
    if (!ticket.typeId) return
    return props.store.types.find(t => t.id === ticket.typeId)
  }, [props.store, ticket])

  const errorCount = useMemo(() => {
    const validators = [
      validator.isIn(ticket.typeId, typeIds),
      !selectedType?.price || props.store.permissions.canUseBankTransfer || ticket.paymentMethod === 'online',
      !selectedType?.price || validator.isNotEmpty(ticket.paymentMethod),
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
  }, [props.fetchedUserData, isAgreed, ticket, typeIds, selectedType, userData])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0) return
    props.nextStep(ticket, userData)
  }, [errorCount, ticket, userData])

  useEffect(() => {
    if (props.ticket) {
      setTicket({
        ...props.ticket,
        paymentMethod: (!props.store.permissions.canUseBankTransfer && 'online') || props.ticket.paymentMethod
      })
    }
    if (props.userData) {
      setUserData(props.userData)
    }
  }, [props.ticket, props.userData])

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

      <h2>申し込む参加種別</h2>
      <FormSection>
        <FormItem>
          <FormLabel>参加種別</FormLabel>
          <FormRadio
            name="type"
            onChange={v => setTicket(s => ({ ...s, typeId: v }))}
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

      {selectedType?.price && (
        <>
          <h2>参加費お支払い方法</h2>
          {selectedType
            ? (
              <FormSection>
                <FormItem>
                  <table>
                    <tbody>
                      <tr>
                        <th>申し込む種別</th>
                        <td>{selectedType.name}</td>
                      </tr>
                      <tr>
                        <th>詳細情報</th>
                        <td>{selectedType.description}</td>
                      </tr>
                      <tr>
                        <th>お支払い額</th>
                        <td>{selectedType.price.toLocaleString()}円</td>
                      </tr>
                    </tbody>
                  </table>
                </FormItem>
                <FormItem>
                  <FormRadio
                    name="paymentMethod"
                    onChange={v => setTicket(s => ({ ...s, paymentMethod: v }))}
                    value={ticket.paymentMethod}
                    values={sockbaseShared.constants.payment.methods
                      .filter(i => i.id !== 'bankTransfer' || props.store.permissions.canUseBankTransfer)
                      .map(i => ({
                        text: i.description,
                        value: i.id
                      }))} />
                </FormItem>
                {ticket.paymentMethod === 'bankTransfer' && (
                  <FormItem>
                    <Alert
                      title="銀行振込の場合、申し込み完了までお時間をいただくことがございます。"
                      type="warning" />
                  </FormItem>
                )}
              </FormSection>
            )
            : (
              <Alert
                title="申し込みたい参加種別を選択してください"
                type="info" />
            )}
        </>
      )}

      <UserDataForm
        fetchedUserData={props.fetchedUserData}
        setUserData={u => setUserData(u)}
        userData={props.userData} />

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
