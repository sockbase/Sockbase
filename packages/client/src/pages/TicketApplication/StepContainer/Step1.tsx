import { useCallback, useEffect, useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormHelp from '../../../components/Form/Help'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import FormRadio from '../../../components/Form/Radio'
import Alert from '../../../components/Parts/Alert'
import useDayjs from '../../../hooks/useDayjs'
import usePostalCode from '../../../hooks/usePostalCode'
import useValidate from '../../../hooks/useValidate'
import type { SockbaseStoreType, SockbaseStoreDocument, SockbaseTicket, SockbaseAccountSecure } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument
  isLoggedIn: boolean
  ticketInfo: SockbaseTicket | undefined
  userData: SockbaseAccountSecure | undefined
  prevStep: () => void
  nextStep: (ticketInfo: SockbaseTicket, userData: SockbaseAccountSecure) => void
}
const Step1: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { getAddressByPostalCode } = usePostalCode()
  const { formatByDate } = useDayjs()

  const initialTicket = useMemo(() => ({
    storeId: props.store.id,
    typeId: '',
    paymentMethod: (!props.store.permissions.canUseBankTransfer && 'online') || ''
  }), [props.store])

  const [isAgreed, setAgreed] = useState(false)
  const [ticketInfo, setTicketInfo] = useState<SockbaseTicket>(initialTicket)

  const [userData, setUserData] = useState<SockbaseAccountSecure>({
    name: '',
    email: '',
    birthday: new Date('1990-01-01').getTime(),
    postalCode: '',
    address: '',
    telephone: '',
    password: '',
    rePassword: ''
  })
  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')

  useEffect(() => {
    if (!props.ticketInfo || !props.userData) return
    setTicketInfo(props.ticketInfo)
    setUserData(props.userData)
    setDisplayBirthday(s => formatByDate(props.userData?.birthday, 'YYYY-MM-DD'))
  }, [props.ticketInfo, props.userData])

  useEffect(() => {
    if (!displayBirthday) return
    setUserData(s => ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  }, [displayBirthday])

  const selectedType = useMemo((): SockbaseStoreType | null => {
    if (!ticketInfo.typeId) return null
    return props.store.types
      .filter(t => t.id === ticketInfo.typeId)[0]
  }, [ticketInfo])

  const errorCount = useMemo((): number => {
    const validators = [
      !validator.isEmpty(ticketInfo.typeId),
      props.store.permissions.canUseBankTransfer || ticketInfo.paymentMethod === 'online',
      !selectedType?.productInfo || !validator.isEmpty(ticketInfo.paymentMethod)
    ]

    if (!props.isLoggedIn) {
      const userDataValidators = [
        !validator.isEmpty(userData.name),
        validator.isPostalCode(userData.postalCode),
        !validator.isEmpty(userData.address),
        !validator.isEmpty(userData.telephone),
        validator.isEmail(userData.email),
        validator.isStrongPassword(userData.password),
        userData.password === userData.rePassword
      ]

      return validators
        .concat(userDataValidators)
        .filter(v => !v)
        .length
    }

    return validators
      .filter(v => !v)
      .length
  }, [ticketInfo, userData, props.isLoggedIn, props.store])

  const handleSubmit = useCallback(() => {
    if (!isAgreed || errorCount > 0) return
    props.nextStep(ticketInfo, userData)
  }, [isAgreed, errorCount, ticketInfo, userData])

  const handleFilledPostalCode = useCallback((postalCode: string): void => {
    const sanitizedPostalCode = postalCode.replaceAll('-', '')
    if (sanitizedPostalCode.length !== 7) return

    getAddressByPostalCode(sanitizedPostalCode)
      .then(address => setUserData(s => ({
        ...s,
        address
      })))
      .catch(err => { throw err })
  }, [])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={() => props.prevStep()}>申し込み説明画面へ戻る</FormButton>
        </FormItem>
      </FormSection>

      <h2>申し込む参加種別</h2>
      <FormSection>
        <FormItem>
          <FormLabel>参加種別</FormLabel>
          <FormRadio
            name="type"
            values={
              props.store.types
                .filter(t => !t.private)
                .map(t => ({
                  text: `${t.name} ${t.price.toLocaleString()}円 / ${t.description}`,
                  value: t.id
                }))
            }
            value={ticketInfo.typeId}
            onChange={v => setTicketInfo(s => ({ ...s, typeId: v }))} />
        </FormItem>
      </FormSection>

      {selectedType?.productInfo && <>
        <h2>参加費お支払い方法</h2>
        {selectedType
          ? <FormSection>
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
                values={sockbaseShared.constants.payment.methods
                  .filter(i => i.id !== 'bankTransfer' || props.store.permissions.canUseBankTransfer)
                  .map(i => ({
                    text: i.description,
                    value: i.id
                  }))}
                value={ticketInfo.paymentMethod}
                onChange={paymentMethod => setTicketInfo(s => ({ ...s, paymentMethod }))} />
            </FormItem>
            {ticketInfo.paymentMethod === 'bankTransfer' && <FormItem>
              <Alert>
                銀行振込の場合、申し込み完了までお時間をいただくことがございます。
              </Alert>
            </FormItem>}
          </FormSection>
          : <Alert>申し込みたい参加種別を選択してください</Alert>}
      </>}

      <h2>申し込み責任者情報</h2>
      {!props.isLoggedIn
        ? <>
          <FormSection>
            <FormItem>
              <FormLabel>氏名</FormLabel>
              <FormInput
                placeholder='速部 すみれ'
                value={userData.name}
                onChange={e => setUserData(s => ({ ...s, name: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>生年月日</FormLabel>
              <FormInput type="date"
                value={displayBirthday}
                onChange={e => setDisplayBirthday(e.target.value)} />
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormLabel>郵便番号</FormLabel>
              <FormInput
                placeholder='0000000'
                value={userData.postalCode}
                onChange={e => {
                  if (e.target.value.length > 7) return
                  handleFilledPostalCode(e.target.value)
                  setUserData(s => ({ ...s, postalCode: e.target.value.trim() }))
                }}
                hasError={!validator.isEmpty(userData.postalCode) && !validator.isPostalCode(userData.postalCode)} />
              <FormHelp>ハイフンは入力不要です</FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormInput
                placeholder='東京都千代田区外神田9-9-9'
                value={userData.address}
                onChange={e => setUserData(s => ({ ...s, address: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput
                placeholder='07001234567'
                value={userData.telephone}
                onChange={e => setUserData(s => ({ ...s, telephone: e.target.value.trim() }))} />
            </FormItem>
          </FormSection>

          <h2>Sockbaseログイン情報</h2>
          <p>
            申し込み情報の確認等に使用するアカウントを作成します。
          </p>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput type="email"
                placeholder='sumire@sockbase.net'
                value={userData.email}
                onChange={e => setUserData(s => ({ ...s, email: e.target.value }))}
                hasError={!validator.isEmpty(userData.email) && !validator.isEmail(userData.email)} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormInput type="password"
                placeholder='●●●●●●●●●●●●'
                value={userData.password}
                onChange={e => setUserData(s => ({ ...s, password: e.target.value }))}
                hasError={!validator.isEmpty(userData.password) && !validator.isStrongPassword(userData.password)} />
              <FormHelp hasError={!validator.isEmpty(userData.password) && !validator.isStrongPassword(userData.password)}>
                アルファベット大文字を含め、英数12文字以上で設定してください。
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>パスワード(確認)</FormLabel>
              <FormInput type="password"
                placeholder='●●●●●●●●●●●●'
                value={userData.rePassword}
                onChange={e => setUserData(s => ({ ...s, rePassword: e.target.value }))}
                hasError={!validator.isEmpty(userData.rePassword) && userData.password !== userData.rePassword} />
              {!validator.isEmpty(userData.rePassword) && userData.password !== userData.rePassword &&
                <FormHelp hasError>パスワードの入力が間違っています</FormHelp>}
            </FormItem>
          </FormSection>
        </>
        : <p>
          現在ログイン中のユーザ情報を引き継ぎます。
        </p>}

      <h2>注意事項</h2>

      <p>
        <a href="/tos" target="_blank">Sockbase利用規約</a>および<a href="/privacy-policy" target="_blank">プライバシーポリシー</a>に同意しますか？
      </p>

      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAggreed"
            label="同意します"
            onChange={(agreement) => setAgreed(agreement)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>

      <FormSection>
        {errorCount > 0 && <FormItem>
          <Alert type="danger">
            {errorCount}個の入力項目に不備があります。
          </Alert>
        </FormItem>}
        <FormItem>
          <FormButton onClick={handleSubmit} disabled={!isAgreed || errorCount > 0}>入力内容確認画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step1
