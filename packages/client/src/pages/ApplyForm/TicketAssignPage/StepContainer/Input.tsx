import { useCallback, useEffect, useMemo, useState } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import UserDataForm from '../../../../components/UserDataForm'
import useDayjs from '../../../../hooks/useDayjs'
import useValidate from '../../../../hooks/useValidate'
import type { SockbaseStoreType, SockbaseStoreDocument, SockbaseAccount, SockbaseAccountSecure } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument
  selectedType: SockbaseStoreType
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
  prevStep: () => void
  nextStep: (userData: SockbaseAccountSecure | undefined) => void
}
const Input: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { formatByDate } = useDayjs()

  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [isAgreed, setAgreed] = useState(false)

  const errorCount = useMemo(() => {
    const validators = [
      isAgreed
    ]

    let errorCount = validators.filter(v => !v).length

    if (props.fetchedUserData) {
      const additionalUserDataValidators = [
        props.fetchedUserData.gender || validator.isIn(userData?.gender?.toString() ?? '', ['1', '2'])
      ]
      errorCount += additionalUserDataValidators.filter(v => !v).length
    } else {
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
  }, [props.fetchedUserData, userData, isAgreed])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0) return
    props.nextStep(userData)
  }, [errorCount, userData])

  useEffect(() => {
    if (props.userData) {
      setUserData(props.userData)
    }
  }, [props.userData])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton
            color="default"
            onClick={props.prevStep}>
            アカウント確認画面へ戻る
          </FormButton>
        </FormItem>
      </FormSection>

      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.name}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{props.selectedType.name}</td>
          </tr>
          <tr>
            <th>開催日時</th>
            <td>{formatByDate(props.store.schedules.startEvent, 'YYYY年 M月 D日 H時mm分')} ～ {formatByDate(props.store.schedules.endEvent, 'H時mm分')}</td>
          </tr>
          <tr>
            <th></th>
            <td>
              <a href={props.store.websiteURL} target="_blank" rel="noreferrer">その他の開催情報…</a>
            </td>
          </tr>
        </tbody>
      </table>

      <UserDataForm
        fetchedUserData={props.fetchedUserData}
        userData={props.userData}
        setUserData={u => setUserData(u)} />

      <h2>注意事項</h2>
      <p>
        <a href="/tos" target="_blank">Sockbase利用規約</a>および<a href="/privacy-policy" target="_blank">プライバシーポリシー</a>に同意しますか？
      </p>

      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAggreed"
            label="同意します"
            onChange={checked => setAgreed(checked)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>

      {errorCount > 0 && <Alert type="danger">
        {errorCount} 個の入力項目に不備があります。
      </Alert>}

      <FormSection>
        <FormButton
          disabled={!isAgreed || errorCount > 0}
          onClick={handleSubmit}>
            入力内容確認画面へ進む
        </FormButton>
      </FormSection>
    </>
  )
}

export default Input
