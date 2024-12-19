import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdSave, MdSend, MdSettings } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormButton from '../../../components/Form/FormButton'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import FormSelect from '../../../components/Form/FormSelect'
import Alert from '../../../components/Parts/Alert'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import Loading from '../../../components/Parts/Loading'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useDayjs from '../../../hooks/useDayjs'
import useError from '../../../hooks/useError'
import useFirebase from '../../../hooks/useFirebase'
import usePostalCode from '../../../hooks/usePostalCode'
import useUserData from '../../../hooks/useUserData'
import useValidate from '../../../hooks/useValidate'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type { SockbaseAccount } from 'sockbase'

const DashboardSettingPage: React.FC = () => {
  const { user, sendPasswordResetURLAsync } = useFirebase()
  const { getMyUserDataAsync, updateUserDataAsync } = useUserData()
  const validator = useValidate()
  const { getAddressByPostalCode } = usePostalCode()
  const { convertErrorMessage } = useError()
  const { formatByDate } = useDayjs()

  const [isProgress, setProgress] = useState(false)
  const [sentPasswordResetUrl, setSentPasswordResetUrl] = useState(false)
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [errorMessage, setErrorMessage] = useState<string | null>()
  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')
  const [displayGender, setDisplayGender] = useState('')

  const errorCount = useMemo(() => {
    if (!userData || !displayBirthday) return null

    const validators = [
      validator.isEmail(userData.email),
      !validator.isEmpty(userData.name),
      validator.isDate(displayBirthday),
      validator.isPostalCode(userData.postalCode),
      !validator.isEmpty(userData.address),
      !validator.isEmpty(userData.telephone),
      !validator.isEmpty(displayGender)
    ]

    return validators.filter(v => !v).length
  }, [userData, displayBirthday, displayGender])

  const handleUpdate = useCallback(() => {
    if (!user || !userData || errorCount !== 0) return

    setErrorMessage(null)
    setProgress(true)

    updateUserDataAsync(user.uid, userData)
      .then(() => {
        alert('更新が完了しました')
        setProgress(false)
      })
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
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

  useEffect(() => {
    const fetchUserDataAsync = async (): Promise<void> => {
      const fetchedUserData = await getMyUserDataAsync()
      if (!fetchedUserData) return
      setUserData(fetchedUserData)
      setDisplayBirthday(formatByDate(fetchedUserData.birthday, 'YYYY-MM-DD'))
      setDisplayGender(fetchedUserData.gender?.toString() ?? '')
    }
    fetchUserDataAsync()
      .catch(err => { throw err })
  }, [getMyUserDataAsync])

  useEffect(() => {
    setUserData(s => s && ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  }, [displayBirthday])

  useEffect(() => {
    setUserData(s => s && ({
      ...s,
      gender: displayGender === '1'
        ? 1
        : displayGender === '2'
          ? 2
          : undefined
    }))
  }, [displayGender])

  return (
    <DashboardBaseLayout title="マイページ設定">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        description="Sockbaseが共通で使用している設定はこのページで変更できます"
        icon={<MdSettings />}
        title="マイページ設定" />

      {userData
        ? (
          <TwoColumnsLayout>
            <>
              <FormSection>
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormInput
                    hasError={!validator.isEmail(userData.email)}
                    onChange={e => setUserData(s => s && ({ ...s, email: e.target.value }))}
                    placeholder="sumire@sockbase.net"
                    value={userData?.email} />
                </FormItem>
                <FormItem>
                  <FormLabel>氏名</FormLabel>
                  <FormInput
                    hasError={validator.isEmpty(userData.name)}
                    onChange={e => setUserData(s => s && ({ ...s, name: e.target.value }))}
                    placeholder="速部 すみれ"
                    value={userData?.name} />
                </FormItem>
                <FormItem>
                  <FormLabel>生年月日</FormLabel>
                  <FormInput
                    hasError={!validator.isDate(displayBirthday)}
                    onChange={e => setDisplayBirthday(e.target.value)}
                    type="date"
                    value={displayBirthday} />
                </FormItem>
                <FormItem>
                  <FormLabel>性別</FormLabel>
                  <FormSelect
                    onChange={e => setDisplayGender(e.target.value)}
                    value={displayGender}>
                    <option value="">選択してください</option>
                    <option value="1">男性</option>
                    <option value="2">女性</option>
                  </FormSelect>
                </FormItem>
                <FormItem>
                  <FormLabel>郵便番号</FormLabel>
                  <FormInput
                    hasError={!validator.isPostalCode(userData.postalCode)}
                    onChange={e => {
                      if (e.target.value.length > 7) return
                      handleFilledPostalCode(e.target.value)
                      setUserData(s => (s && { ...s, postalCode: e.target.value }))
                    }}
                    placeholder="0000000"
                    value={userData?.postalCode} />
                </FormItem>
                <FormItem>
                  <FormLabel>住所</FormLabel>
                  <FormInput
                    hasError={validator.isEmpty(userData.address)}
                    onChange={e => setUserData(s => s && ({ ...s, address: e.target.value }))}
                    placeholder="東京都千代田区外神田9-9-9"
                    value={userData?.address} />
                </FormItem>
                <FormItem>
                  <FormLabel>電話番号</FormLabel>
                  <FormInput
                    hasError={validator.isEmpty(userData.telephone)}
                    onChange={e => setUserData(s => s && ({ ...s, telephone: e.target.value }))}
                    placeholder="07001234567"
                    value={userData?.telephone} />
                </FormItem>
              </FormSection>

              {errorMessage && (
                <Alert
                  title="エラーが発生しました"
                  type="error">{errorMessage}
                </Alert>
              )}
              {errorCount !== 0 && (
                <Alert
                  title={`${errorCount} 個の入力項目に不備があります。`}
                  type="error" />
              )}

              <FormSection>
                <FormItem>
                  <LoadingCircleWrapper
                    inlined={true}
                    isLoading={isProgress}>
                    <FormButton
                      color="primary"
                      disabled={isProgress || errorCount !== 0}
                      onClick={handleUpdate}>
                      <IconLabel
                        icon={<MdSave />}
                        label="情報を更新する" />
                    </FormButton>
                  </LoadingCircleWrapper>
                </FormItem>
              </FormSection>
            </>

            <>
              <h3>パスワードリセット</h3>
              <FormSection>
                <FormItem>
                  <FormButton
                    disabled={sentPasswordResetUrl}
                    onClick={handleClickPasswordReset}>
                    <IconLabel
                      icon={<MdSend />}
                      label="パスワードリセットリンクを送付" />
                  </FormButton>
                </FormItem>
              </FormSection>
              {sentPasswordResetUrl && (
                <p>
              パスワードリセットリンクは既に送付済みです。<br />
              受信トレイをご確認ください。
                </p>
              )}

              <h3>アカウント削除</h3>
              <p>
              アカウント削除を希望される方は <Link to="/contact">お問い合わせ</Link> よりご連絡ください。
              </p>
            </>
          </TwoColumnsLayout>
        )
        : <Loading text="ユーザ情報" />}
    </DashboardBaseLayout>
  )
}

export default DashboardSettingPage
