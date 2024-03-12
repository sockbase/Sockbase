import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMGear } from 'react-fluentui-emoji/lib/modern'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Alert from '../../components/Parts/Alert'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Loading from '../../components/Parts/Loading'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useFirebase from '../../hooks/useFirebase'
import useFirebaseError from '../../hooks/useFirebaseError'
import usePostalCode from '../../hooks/usePostalCode'
import useUserData from '../../hooks/useUserData'
import useValidate from '../../hooks/useValidate'
import type { SockbaseAccount } from 'sockbase'

const DashboardSettingsPage: React.FC = () => {
  const { user, sendPasswordResetURLAsync } = useFirebase()
  const { getMyUserDataAsync, updateUserDataAsync } = useUserData()
  const validator = useValidate()
  const { getAddressByPostalCode } = usePostalCode()
  const { localize: localizeFirebaseError } = useFirebaseError()

  const [isProgress, setProgress] = useState(false)
  const [sentPasswordResetUrl, setSentPasswordResetUrl] = useState(false)
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [error, setError] = useState<Error | null>()
  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')

  const onInitialize: () => void =
    () => {
      const fetchUserDataAsync: () => Promise<void> =
        async () => {
          const fetchedUserData = await getMyUserDataAsync()
          if (!fetchedUserData) return
          setUserData(fetchedUserData)
        }
      fetchUserDataAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [getMyUserDataAsync])

  const onUpdateBirthday: () => void =
    () => setUserData(s => s && ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  useEffect(onUpdateBirthday, [displayBirthday])

  const errorCount = useMemo((): number | null => {
    if (!userData || !displayBirthday) return null

    const validators = [
      validator.isEmail(userData.email),
      !validator.isEmpty(userData.name),
      validator.isDate(displayBirthday),
      validator.isPostalCode(userData.postalCode),
      !validator.isEmpty(userData.address),
      !validator.isEmpty(userData.telephone)
    ]

    return validators.filter(v => !v).length
  }, [userData, displayBirthday])

  const handleUpdate = useCallback(() => {
    if (!user || !userData || errorCount !== 0) return

    setError(null)
    setProgress(true)

    updateUserDataAsync(user.uid, userData)
      .then(() => {
        alert('更新が完了しました')
        setProgress(false)
      })
      .catch(err => {
        setError(new Error(localizeFirebaseError(err)))
      })
  }, [user, userData, errorCount])

  const handleClickPasswordReset = useCallback(() => {
    if (!user?.email) return
    setSentPasswordResetUrl(true)

    sendPasswordResetURLAsync(user.email)
      .then(() => alert('パスワードリセットリンクを送付しました。'))
      .catch(err => {
        alert('パスワードリセットリンク送付時にエラーが発生しました。')
        setSentPasswordResetUrl(false)
        throw err
      })
  }, [user])

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
    <DashboardBaseLayout title="マイページ設定">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<IconMGear />}
        title="マイページ設定"
        description="Sockbaseが共通で使用している設定はこのページで変更できます" />

      {userData
        ? <TwoColumnsLayout>
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
                <LoadingCircleWrapper isLoading={isProgress} inlined={true}>
                  <FormButton
                    inlined={true}
                    disabled={isProgress || errorCount !== 0}
                    onClick={handleUpdate}>情報を更新する</FormButton>
                </LoadingCircleWrapper>
              </FormItem>
            </FormSection>
          </>

          <>
            <h3>パスワードリセット</h3>
            <FormSection>
              <FormItem>
                <FormButton onClick={handleClickPasswordReset} disabled={sentPasswordResetUrl}>パスワードリセットリンクを送付</FormButton>
              </FormItem>
            </FormSection>
            {sentPasswordResetUrl && <p>
              パスワードリセットリンクは既に送付済みです。<br />
              受信トレイをご確認ください。
            </p>}

            <h3>アカウント削除</h3>
            <p>
              アカウント削除は現在準備中です。<br />
              削除を希望される方は「お問い合わせ」よりご連絡ください。
            </p>
          </>
        </TwoColumnsLayout>
        : <Loading text="ユーザ情報" />}
    </DashboardBaseLayout>
  )
}

export default DashboardSettingsPage
