import { useEffect, useMemo, useState } from 'react'
import type { SockbaseAccount } from 'sockbase'
import useUserData from '../../hooks/useUserData'
import useInquiry from '../../hooks/useInquiry'
import useValidate from '../../hooks/useValidate'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/Label'
import FormTextarea from '../../components/Form/Textarea'
import FormSelect from '../../components/Form/Select'
import FormButton from '../../components/Form/Button'
import FormInput from '../../components/Form/Input'
import Alert from '../../components/Parts/Alert'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import FormHelp from '../../components/Form/Help'
import Loading from '../../components/Parts/Loading'
import inquiryHelper from '../../helpers/inquiryHelper'

const maxBodyLength = 1000

const Contact: React.FC = () => {
  const { getMyUserDataAsync } = useUserData()
  const validator = useValidate()
  const { submitInquiry } = useInquiry()

  const [userData, setUserData] = useState<SockbaseAccount>()

  const [errorCount, setErrorCount] = useState(0)
  const [isProgress, setProgress] = useState(false)
  const [isSuccess, setSuccess] = useState(false)

  const [type, setType] = useState('')
  const [body, setBody] = useState('')
  const [bodyLength, setBodyLength] = useState(0)

  const onInitialize: () => void =
    () => {
      const fetchMyUserDataAsync: () => Promise<void> =
        async () => {
          const fetchedUserData = await getMyUserDataAsync()
          if (!fetchedUserData) return
          setUserData(fetchedUserData)
        }
      fetchMyUserDataAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [getMyUserDataAsync])

  const onChange: () => void =
    () => {
      const bodyLength = body.length
      const validators = [
        validator.isIn(type, inquiryHelper.inquiryTypes.map(t => t.type)),
        !validator.isEmpty(body),
        bodyLength <= maxBodyLength
      ]

      const _errorCount = validators.filter(e => !e).length
      setErrorCount(_errorCount)
      setBodyLength(bodyLength)
    }
  useEffect(onChange, [type, body])

  const handleSubmit: () => void =
    () => {
      if (errorCount) return
      if (!type || !body) return

      setProgress(true)

      submitInquiry(type, body)
        .then(() => setSuccess(true))
        .catch(err => { throw err })
        .finally(() => setProgress(false))
    }

  const inquiryContext = useMemo(() => {
    if (!type) return

    const selectedInquiry = inquiryHelper.inquiryTypes.filter(t => t.type === type)[0]
    return selectedInquiry
  }, [type])

  return (
    <>
      {userData
        ? isSuccess
          ? <Alert type="success" title="送信が完了しました">
            お問い合わせが完了しました。<br />
            通常3営業日以内にメールにてご返信いたしますので、今しばらくお待ちください。
          </Alert>
          : <>
            <FormSection>
              <FormItem>
                <FormLabel>お名前</FormLabel>
                <FormInput
                  disabled
                  defaultValue={userData.name} />
              </FormItem>
              <FormItem>
                <FormLabel>ご返信先メールアドレス</FormLabel>
                <FormInput
                  disabled
                  defaultValue={userData.email} />
              </FormItem>
              <FormItem>
                <FormLabel>お問い合わせ種類</FormLabel>
                <FormSelect
                  value={type}
                  onChange={e => setType(e.target.value)}>
                  <option value=''>お問い合わせ内容を選択してください</option>
                  {inquiryHelper.inquiryTypes.map(ct => <option key={ct.type} value={ct.type}>{ct.name}</option>)}
                </FormSelect>
              </FormItem>
              <FormItem>
                <FormLabel>お問い合わせ内容</FormLabel>
                {inquiryContext?.description && <FormItem>
                  <Alert type='danger' title={inquiryContext?.name}>
                    {inquiryContext?.description ?? ''}
                  </Alert>
                </FormItem>}
                <FormTextarea value={body} onChange={e => setBody(e.target.value)} />
                <FormHelp>お問い合わせ内容を{maxBodyLength}文字以下で入力してください。</FormHelp>
                <FormLabel>{bodyLength} / {maxBodyLength}</FormLabel>
              </FormItem>
            </FormSection>

            {errorCount !== 0 && <Alert type="danger">{errorCount}個の入力項目に不備があります。</Alert>}

            <p>
              返信はメールにて行います。<br />
              迷惑メール設定にてドメイン規制設定を行なっている方は、受信許可ドメインに<code>@sockbase.net</code>を追加してください。
            </p>

            <FormSection>
              <FormItem>
                <LoadingCircleWrapper isLoading={isProgress} inlined>
                  <FormButton
                    inlined
                    onClick={handleSubmit}
                    disabled={isProgress || isSuccess || errorCount !== 0}>送信</FormButton>
                </LoadingCircleWrapper>
              </FormItem>
            </FormSection>
          </>
        : <Loading text="ユーザ情報" />}
    </>
  )
}

export default Contact