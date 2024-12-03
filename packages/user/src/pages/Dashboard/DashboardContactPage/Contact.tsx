import { useEffect, useMemo, useState } from 'react'
import { MdSend } from 'react-icons/md'
import FormButton from '../../../components/Form/FormButton'
import FormHelp from '../../../components/Form/FormHelp'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import FormSelect from '../../../components/Form/FormSelect'
import FormTextarea from '../../../components/Form/FormTextarea'
import Alert from '../../../components/Parts/Alert'
import IconLabel from '../../../components/Parts/IconLabel'
import Loading from '../../../components/Parts/Loading'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import inquiryHelper from '../../../helpers/inquiryHelper'
import useInquiry from '../../../hooks/useInquiry'
import useUserData from '../../../hooks/useUserData'
import useValidate from '../../../hooks/useValidate'
import type { SockbaseAccount } from 'sockbase'

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
  }, [type, submitInquiry])

  return (
    <>
      {userData
        ? isSuccess
          ? (
            <Alert
              title="送信が完了しました"
              type="success">
            お問い合わせが完了しました。<br />
            通常 3 営業日以内にメールにてご返信いたしますので、今しばらくお待ちください。
            </Alert>
          )
          : (
            <>
              <FormSection>
                <FormItem>
                  <FormLabel>お名前</FormLabel>
                  <FormInput
                    defaultValue={userData.name}
                    disabled />
                </FormItem>
                <FormItem>
                  <FormLabel>ご返信先メールアドレス</FormLabel>
                  <FormInput
                    defaultValue={userData.email}
                    disabled />
                </FormItem>
                <FormItem>
                  <FormLabel>お問い合わせ種類</FormLabel>
                  <FormSelect
                    onChange={e => setType(e.target.value)}
                    value={type}>
                    <option value="">お問い合わせ内容を選択してください</option>
                    {inquiryHelper.inquiryTypes.map(ct => (
                      <option
                        key={ct.type}
                        value={ct.type}>{ct.name}
                      </option>
                    ))}
                  </FormSelect>
                </FormItem>
                <FormItem>
                  <FormLabel>お問い合わせ内容</FormLabel>
                  {inquiryContext?.description && (
                    <FormItem>
                      <Alert
                        title={inquiryContext?.name}
                        type="info">
                        {inquiryContext?.description ?? ''}
                      </Alert>
                    </FormItem>
                  )}
                  <FormTextarea
                    hasError={bodyLength > maxBodyLength}
                    onChange={e => setBody(e.target.value)}
                    value={body} />
                  <FormHelp hasError={bodyLength > maxBodyLength}>
                  お問い合わせ内容を {maxBodyLength.toLocaleString()} 文字以下で入力してください。
                  </FormHelp>
                  <FormLabel>{bodyLength.toLocaleString()} 文字 / {maxBodyLength.toLocaleString()} 文字</FormLabel>
                </FormItem>
              </FormSection>

              {errorCount !== 0 && (
                <Alert
                  title={`${errorCount} 個の入力項目に不備があります。`}
                  type="error" />
              )}

              <p>
              返信はメールにて行います。<br />
              迷惑メール設定にてドメイン規制設定を行なっている方は、受信許可ドメインに <code>@sockbase.net</code> を追加してください。
              </p>

              <FormSection>
                <FormItem>
                  <LoadingCircleWrapper
                    inlined={true}
                    isLoading={isProgress}>
                    <FormButton
                      color="primary"
                      disabled={isProgress || isSuccess || errorCount !== 0}
                      onClick={handleSubmit}>
                      <IconLabel
                        icon={<MdSend />}
                        label="送信する" />
                    </FormButton>
                  </LoadingCircleWrapper>
                </FormItem>
              </FormSection>
            </>
          )
        : <Loading text="ユーザ情報" />}
    </>
  )
}

export default Contact
