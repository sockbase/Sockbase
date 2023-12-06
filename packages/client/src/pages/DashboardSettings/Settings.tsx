import { useEffect, useState } from 'react'
import type { SockbaseAccount } from 'sockbase'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/Label'
import FormInput from '../../components/Form/Input'
import FormButton from '../../components/Form/Button'
import useDayjs from '../../hooks/useDayjs'
import useValidate from '../../hooks/useValidate'
import useFirebaseError from '../../hooks/useFirebaseError'
import Alert from '../../components/Parts/Alert'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import usePostalCode from '../../hooks/usePostalCode'

interface Props {
  userData: SockbaseAccount
  updateUserDataAsync: (userData: SockbaseAccount) => Promise<void>
}
const DashboardSettings: React.FC<Props> = (props) => {
  const dayjs = useDayjs()
  const validator = useValidate()
  const { getAddressByPostalCode } = usePostalCode()
  const { localize: localizeFirebaseError } = useFirebaseError()

  const [isProgress, setProgress] = useState(false)
  const [userData, setUserData] = useState<SockbaseAccount>()

  const [errorCount, setErrorCount] = useState(0);
  const [error, setError] = useState<Error | null>()

  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')

  const onInitialize: () => void =
    () => {
      if (!props.userData) return
      setUserData(props.userData)
      setDisplayBirthday(dayjs.formatByDate(props.userData.birthday, 'YYYY-MM-DD'))
    }
  useEffect(onInitialize, [props.userData])

  const onUpdateUserData: () => void =
    () => {
      if (!userData || !displayBirthday) return

      const validators = [
        validator.isEmail(userData.email),
        !validator.isEmpty(userData.name),
        validator.isDate(displayBirthday),
        validator.isPostalCode(userData.postalCode),
        !validator.isEmpty(userData.address),
        !validator.isEmpty(userData.telephone)
      ]

      const currentErrorCount = validators.filter(v => !v).length
      setErrorCount(currentErrorCount)
    }
  useEffect(onUpdateUserData, [userData, displayBirthday])

  const onUpdateBirthday: () => void =
    () => setUserData(s => s && ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  useEffect(onUpdateBirthday, [displayBirthday])

  const handleSubmit: () => void =
    () => {
      if (!userData || errorCount !== 0) return

      setError(null)
      setProgress(true)
      props.updateUserDataAsync(userData)
        .then(() => {
          alert('更新が完了しました')
          setProgress(false)
        })
        .catch(err => setError(new Error(localizeFirebaseError(err))))
    }

  const handleFilledPostalCode = (postalCode: string): void => {
    const sanitizedPostalCode = postalCode.replaceAll('-', '')
    if (sanitizedPostalCode.length !== 7) return

    getAddressByPostalCode(sanitizedPostalCode)
      .then(address => setUserData(s => (s && {
        ...s,
        address
      })))
      .catch(err => {
        throw err
      })
  }

  return (
    <>
      {userData && <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput
                placeholder='sumire@sockbase.net'
                value={userData?.email}
                onChange={e => setUserData(s => s && ({ ...s, email: e.target.value }))}
                hasError={!validator.isEmail(userData.email)} />
            </FormItem>
            <FormItem>
              <FormLabel>氏名</FormLabel>
              <FormInput
                placeholder='速部 すみれ'
                value={userData?.name}
                onChange={e => setUserData(s => s && ({ ...s, name: e.target.value }))}
                hasError={validator.isEmpty(userData.name)} />
            </FormItem>
            <FormItem>
              <FormLabel>誕生日</FormLabel>
              <FormInput
                type="date"
                value={displayBirthday}
                onChange={e => setDisplayBirthday(e.target.value)}
                hasError={!validator.isDate(displayBirthday)} />
            </FormItem>
            <FormItem>
              <FormLabel>郵便番号</FormLabel>
              <FormInput
                placeholder='0000000'
                value={userData?.postalCode}
                onChange={e => {
                  if (e.target.value.length > 7) return
                  handleFilledPostalCode(e.target.value)
                  setUserData(s => (s && { ...s, postalCode: e.target.value }))
                }}
                hasError={!validator.isPostalCode(userData.postalCode)} />
            </FormItem>
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormInput
                placeholder='東京都千代田区外神田9-9-9'
                value={userData?.address}
                onChange={e => setUserData(s => s && ({ ...s, address: e.target.value }))}
                hasError={validator.isEmpty(userData.address)} />
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput
                placeholder='07001234567'
                value={userData?.telephone}
                onChange={e => setUserData(s => s && ({ ...s, telephone: e.target.value }))}
                hasError={validator.isEmpty(userData.telephone)} />
            </FormItem>
          </FormSection>

          {error && <Alert type="danger" title="エラーが発生しました">{error.message}</Alert>}
          {errorCount !== 0 && <Alert type="danger">{errorCount}個の入力項目に不備があります。</Alert>}

          <FormSection>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress} inlined>
                <FormButton
                  inlined
                  disabled={isProgress || errorCount !== 0}
                  onClick={handleSubmit}>情報を更新する</FormButton>
              </LoadingCircleWrapper>
            </FormItem>
          </FormSection>
        </>

        <>
          <h2>お問い合わせ</h2>

          <h3>パスワード</h3>
          <p>
            パスワードの再設定は現在準備中です。<br />
            再設定を希望される方は「お問い合わせ」よりご連絡ください。
          </p>

          <h3>アカウント削除</h3>
          <p>
            アカウント削除は現在準備中です。<br />
            削除を希望される方は「お問い合わせ」よりご連絡ください。
          </p>
        </>
      </TwoColumnsLayout>}
    </>
  )
}

export default DashboardSettings
