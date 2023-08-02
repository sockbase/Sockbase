import { useEffect, useMemo, useState } from 'react'
import { type SockbaseTicketUserDocument, type SockbaseStoreDocument, type SockbaseAccountSecure } from 'sockbase'
import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import FormCheckbox from '../../../Form/Checkbox'
import useDayjs from '../../../../hooks/useDayjs'
import usePostalCode from '../../../../hooks/usePostalCode'
import FormLabel from '../../../Form/Label'
import FormInput from '../../../Form/Input'
import FormHelp from '../../../Form/Help'
import useValidate from '../../../../hooks/useValidate'
import Alert from '../../../Parts/Alert'

interface Props {
  isLoggedIn: boolean
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  userData: SockbaseAccountSecure | undefined
  nextStep: (userData: SockbaseAccountSecure) => void
}
const Step1: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  const { getAddressByPostalCode } = usePostalCode()
  const validator = useValidate()

  const [isAgreed, setAgreed] = useState(false)
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

  const onInitialize = (): void => {
    if (!props.userData) return
    setUserData(props.userData)
  }
  useEffect(onInitialize, [props.userData])

  const onChangeBirthday = (): void => {
    if (!displayBirthday) return
    setUserData(s => ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  }
  useEffect(onChangeBirthday, [displayBirthday])

  const handleFilledPostalCode: (postalCode: string) => void =
    (postalCode) => {
      const sanitizedPostalCode = postalCode.replaceAll('-', '')
      if (sanitizedPostalCode.length !== 7) return

      getAddressByPostalCode(sanitizedPostalCode)
        .then(address => setUserData(s => ({
          ...s,
          address
        })))
        .catch(err => {
          throw err
        })
    }

  const handleSubmit = (): void => {
    if (!isAgreed || errorCount > 0) return
    props.nextStep(userData)
  }

  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  const errorCount = useMemo((): number => {
    if (props.isLoggedIn) return 0

    const userDataValidators = [
      !validator.isEmpty(userData.name),
      validator.isPostalCode(userData.postalCode),
      !validator.isEmpty(userData.address),
      !validator.isEmpty(userData.telephone),
      validator.isEmail(userData.email),
      validator.isStrongPassword(userData.password),
      userData.password === userData.rePassword
    ]

    return userDataValidators
      .filter(v => !v)
      .length
  }, [userData, props.isLoggedIn])

  return (
    <>
      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.storeName}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{typeName}</td>
          </tr>
          <tr>
            <th>開催日時</th>
            <td>{formatByDate(props.store.schedules.startEvent, 'YYYY年M月D日 H:mm')} ～ {formatByDate(props.store.schedules.endEvent, 'H:mm')}</td>
          </tr>
          <tr>
            <th></th>
            <td>
              <a href={props.store.storeWebURL} target="_blank" rel="noreferrer">その他の開催情報…</a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>使用者情報</h2>

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
                  setUserData(s => ({ ...s, postalCode: e.target.value }))
                }}
                hasError={!validator.isEmpty(userData.postalCode) && !validator.isPostalCode(userData.postalCode)} />
              <FormHelp>
                ハイフンは入力不要です
              </FormHelp>
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
                onChange={e => setUserData(s => ({ ...s, telephone: e.target.value }))} />
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
          <FormButton onClick={handleSubmit} disabled={!isAgreed || !!errorCount}>入力内容確認画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step1
