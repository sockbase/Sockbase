import { useCallback, useMemo } from 'react'
import { MdArrowForward, MdLogout } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import dummyEyecatchImage from '../../../../assets/dummy-eyecatch.jpg'
import FormButton from '../../../../components/Form/FormButton'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import LoginForm from '../../../../components/LoginForm'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import type { User } from 'firebase/auth'
import type { SockbaseApplicationDocument, SockbaseEventDocument } from 'sockbase'

interface Props {
  pastApps: SockbaseApplicationDocument[] | null | undefined
  event: SockbaseEventDocument | undefined
  eyecatchURL: string | null | undefined
  user: User | null | undefined
  loginAsync: (email: string, password: string) => Promise<void>
  logoutAsync: () => Promise<void>
  nextStep: () => void
}
const CheckAccount: React.FC<Props> = (props) => {
  const appliedApp = useMemo(() => {
    if (!props.pastApps || !props.event) return
    const pastApps = props.pastApps.filter(a => a.eventId === props.event?.id)
    if (pastApps.length === 0) return null
    return pastApps[0]
  }, [props.pastApps, props.event])

  const handleLogout = useCallback(() => {
    props.logoutAsync()
      .catch(err => { throw err })
  }, [])

  return (
    <>
      <p>
        {props.eyecatchURL
          ? <EyecatchImage src={props.eyecatchURL} />
          : <EyecatchImage src={dummyEyecatchImage} />}
      </p>

      <h1>Sockbase アカウントはお持ちですか？</h1>

      {props.user === null && <>
        <h2>Sockbase アカウントを持っている場合</h2>
        <p>
            以前の申し込み時に使用したアカウントでログインしてください。
        </p>

        <LoginForm />

        <h2>Sockbase アカウントを持っていない場合</h2>
        <p>
          申し込み手続き中にアカウントを作成します。<br />
          「申し込み説明画面へ進む」を押して次の画面に進んでください。
        </p>
      </>}

      {props.user && <>
        <p>
          現在、<b>{props.user.email}</b> としてログインしています。<br />
        </p>
        {appliedApp && <Alert type="error" title="二重申し込みはできません">
          このイベントには申し込み済みです。<br />
          申し込み情報は <Link to={`/dashboard/applications/${appliedApp.hashId}`}>こちら</Link> からご確認いただけます。
        </Alert>}
        <Alert type="info" title="別のアカウントで申し込みを行うには、ログアウトしてください。" />
        <FormSection>
          <FormItem>
            <FormButton color="default" onClick={handleLogout}>
              <IconLabel icon={<MdLogout />} label="ログアウト" />
            </FormButton>
          </FormItem>
        </FormSection>
      </>}

      {(!props.user || appliedApp === null) && <FormSection>
        <FormItem>
          <FormButton onClick={props.nextStep}>
            <IconLabel icon={<MdArrowForward />} label="申し込み説明画面へ進む" />
          </FormButton>
        </FormItem>
      </FormSection>}
    </>
  )
}

export default CheckAccount

const EyecatchImage = styled.img`
  width: 100%;
`
