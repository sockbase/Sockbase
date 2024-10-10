import { useState, useCallback, useEffect, useMemo } from 'react'
import useDayjs from '../hooks/useDayjs'
import usePostalCode from '../hooks/usePostalCode'
import useValidate from '../hooks/useValidate'
import FormItem from './Form/FormItem'
import FormSection from './Form/FormSection'
import FormHelp from './Form/Help'
import FormInput from './Form/Input'
import FormLabel from './Form/Label'
import FormSelect from './Form/Select'
import type { SockbaseAccount, SockbaseAccountSecure } from 'sockbase'

const initialUserDataBase = {
  name: '',
  birthday: '1990-01-01',
  postalCode: '',
  address: '',
  telephone: '',
  email: '',
  gender: '',
  password: '',
  rePassword: ''
}

interface Props {
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
  setUserData: (userData: SockbaseAccountSecure) => void
}
const UserDataForm: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { formatByDate } = useDayjs()
  const { getAddressByPostalCode } = usePostalCode()

  const [userData, setUserData] = useState(initialUserDataBase)

  const [isFetchedAddress, setFetchedAddress] = useState(false)

  const fetchedUserData = useMemo(() => {
    if (!props.fetchedUserData) return
    return {
      ...props.fetchedUserData,
      birthday: formatByDate(props.fetchedUserData?.birthday, 'YYYY-MM-DD')
    }
  }, [props.fetchedUserData])

  const handleFilledPostalCode = useCallback((postalCode: string) => {
    setUserData(s => ({ ...s, postalCode: postalCode.trim() }))
    const sanitizedPostalCode = postalCode.replaceAll('-', '')
    setFetchedAddress(false)

    if (sanitizedPostalCode.length === 7) {
      getAddressByPostalCode(sanitizedPostalCode)
        .then(fetchedAddress => {
          setUserData(s => ({ ...s, address: fetchedAddress }))
          setFetchedAddress(true)
        })
        .catch(err => { throw err })
    } else if (sanitizedPostalCode.length === 0) {
      setUserData(s => ({ ...s, address: '' }))
    }
  }, [])

  useEffect(() => {
    if (!props.userData) return
    setUserData({
      ...props.userData,
      birthday: formatByDate(props.userData.birthday, 'YYYY-MM-DD'),
      gender: props.userData.gender?.toString() ?? ''
    })
    setFetchedAddress(props.userData.postalCode.length === 7)
  }, [props.userData])

  useEffect(() => {
    props.setUserData({
      ...userData,
      birthday: new Date(userData.birthday).getTime(),
      gender: userData.gender === '1'
        ? 1
        : userData.gender === '2'
          ? 2
          : undefined
    })
  }, [userData])

  return (
    <>
      {(!fetchedUserData?.gender && <>
        <h2>申し込み責任者情報</h2>
        <FormSection>
          <FormItem>
            <FormLabel>氏名</FormLabel>
            <FormInput
              placeholder='速部 すみれ'
              value={fetchedUserData?.name || userData.name}
              onChange={e => setUserData(s => ({ ...s, name: e.target.value }))}
              disabled={!!fetchedUserData} />
          </FormItem>
          <FormItem>
            <FormLabel>生年月日</FormLabel>
            <FormInput type="date"
              value={fetchedUserData?.birthday || userData.birthday}
              onChange={e => setUserData(s => ({ ...s, birthday: e.target.value }))}
              disabled={!!fetchedUserData} />
          </FormItem>
          <FormItem>
            <FormLabel>性別</FormLabel>
            <FormSelect
              value={fetchedUserData?.gender || userData.gender}
              onChange={e => setUserData(s => ({ ...s, gender: e.target.value }))}
              hasError={fetchedUserData && !fetchedUserData.gender && !userData.gender}>
              <option value="">選択してください</option>
              <option value="1">男性</option>
              <option value="2">女性</option>
            </FormSelect>
          </FormItem>
        </FormSection>
        <FormSection>
          <FormItem>
            <FormLabel>郵便番号</FormLabel>
            <FormInput
              placeholder='0000000'
              value={fetchedUserData?.postalCode || userData.postalCode}
              onChange={e => handleFilledPostalCode(e.target.value)}
              hasError={!validator.isEmpty(userData.postalCode) && !validator.isPostalCode(userData.postalCode)}
              disabled={!!fetchedUserData} />
            <FormHelp>
              ハイフンは入力不要です
            </FormHelp>
          </FormItem>
          <FormItem>
            <FormLabel>住所</FormLabel>
            <FormInput
              placeholder='東京都千代田区外神田9-9-9'
              value={fetchedUserData?.address || userData.address}
              onChange={e => setUserData(s => ({ ...s, address: e.target.value }))}
              disabled={!!fetchedUserData || !isFetchedAddress} />
            <FormHelp>
              住所は都道府県からはじめ、番地・部屋番号まで記入してください。
            </FormHelp>
          </FormItem>
          <FormItem>
            <FormLabel>電話番号</FormLabel>
            <FormInput
              placeholder='07001234567'
              value={fetchedUserData?.telephone || userData.telephone}
              onChange={e => setUserData(s => ({ ...s, telephone: e.target.value.trim() }))}
              disabled={!!fetchedUserData} />
          </FormItem>
        </FormSection>
      </>) ?? <></>}

      {(!fetchedUserData && <>
        <h2>Sockbase ログイン情報</h2>
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
            <FormLabel>パスワード (確認)</FormLabel>
            <FormInput type="password"
              placeholder='●●●●●●●●●●●●'
              value={userData.rePassword}
              onChange={e => setUserData(s => ({ ...s, rePassword: e.target.value }))}
              hasError={!validator.isEmpty(userData.rePassword) && userData.password !== userData.rePassword} />
            {!validator.isEmpty(userData.rePassword) && userData.password !== userData.rePassword &&
                <FormHelp hasError>パスワードの入力が間違っています</FormHelp>}
          </FormItem>
        </FormSection>
      </>) ?? <></>}
    </>
  )
}

export default UserDataForm
