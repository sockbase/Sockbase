import { useCallback, useMemo, useState } from 'react'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormHelp from '../../../components/Form/Help'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import useValidate from '../../../hooks/useValidate'

interface Props {
  submitAsync: (password: string) => Promise<void>
}
const PasswordInputForm: React.FC<Props> = (props) => {
  const validator = useValidate()

  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')

  const [isProgress, setProgress] = useState(false)

  const errorCount = useMemo(() => {
    const validators = [
      validator.isStrongPassword(password),
      validator.isNotEmpty(rePassword),
      password === rePassword
    ]
    return validators.filter(v => !v).length
  }, [password, rePassword])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0 || !password) return

    setProgress(true)

    props.submitAsync(password)
      .catch(err => {
        setProgress(false)
        throw err
      })
  }, [errorCount, password])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormLabel>新しいパスワード</FormLabel>
          <FormInput type="password"
            placeholder='●●●●●●●●●●●●'
            value={password}
            onChange={e => setPassword(e.target.value)}
            hasError={!validator.isEmpty(password) && !validator.isStrongPassword(password)} />
          <FormHelp hasError={!validator.isEmpty(password) && !validator.isStrongPassword(password)}>
            アルファベット大文字を含め、英数12文字以上で設定してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>新しいパスワード (確認)</FormLabel>
          <FormInput type="password"
            placeholder='●●●●●●●●●●●●'
            value={rePassword}
            onChange={e => setRePassword(e.target.value)}
            hasError={!validator.isEmpty(rePassword) && password !== rePassword} />
          {!validator.isEmpty(rePassword) && password !== rePassword &&
            <FormHelp hasError>
              パスワードの入力が間違っています
            </FormHelp>}
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormButton
            onClick={handleSubmit}
            disabled={errorCount > 0 || isProgress}>
            パスワードを変更する
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default PasswordInputForm
