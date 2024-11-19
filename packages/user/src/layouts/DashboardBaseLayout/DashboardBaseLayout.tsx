import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAtom } from 'jotai'
import LogotypeSVG from '../../assets/logotype.svg'
import isSlimAtom from '../../atoms/isSlimAtom'
import FormButton from '../../components/Form/FormButton'
import useFirebase from '../../hooks/useFirebase'
import HeadHelper from '../../libs/Helmet'
import RequiredLogin from '../../libs/RequiredLogin'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardBaseLayout: React.FC<Props> = (props) => {
  const {
    user,
    logoutAsync,
    sendVerifyMailAsync
  } = useFirebase()
  const navigate = useNavigate()

  const [sentVerifyMail, setSentVerifyMail] = useState(false)
  const [isSlim, setSlim] = useAtom(isSlimAtom)

  const handleLogout = useCallback(() => {
    logoutAsync()
      .then(() => navigate('/'))
      .catch(err => { throw err })
  }, [])

  const handleSendVerifyMail = useCallback(() => {
    sendVerifyMailAsync()
      .then(() => {
        alert('送信が完了しました。')
        setSentVerifyMail(true)
      })
      .catch(err => {
        alert('エラーが発生しました。')
        throw err
      })
  }, [sendVerifyMailAsync])

  return (
    <Container>
      <RequiredLogin />
      {user && <>
        <HeadHelper title={props.title} />
        <HeaderWrap>
          <Link to="/dashboard">
            <Logotype src={LogotypeSVG} alt="Sockbase Logotype" />
          </Link>
        </HeaderWrap>
        <MainWrap isSlim={isSlim}>
          {!user.emailVerified && <AlertArea>
            <Alert>
              メールアドレスの確認が必要です
              <Button onClick={handleSendVerifyMail} disabled={sentVerifyMail}>確認メール送信</Button>
            </Alert>
          </AlertArea>}
          <SidebarArea>
            <Sidebar
              logout={handleLogout}
              user={user}
              isSlim={isSlim}
              setSlim={setSlim} />
          </SidebarArea>
          <MainArea>
            <Main>{props.children}</Main>
          </MainArea>
        </MainWrap>
      </>}
    </Container>
  )
}

export default DashboardBaseLayout

const Container = styled.section`
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`
const HeaderWrap = styled.header`
  padding: 10px;
  background-color: var(--brand-color);
`
const MainWrap = styled.section<{ isSlim: boolean }>`
  display: grid;
  height: 100%;
  overflow-y: hidden;
  grid-template-rows: auto 1fr;

  ${props => props.isSlim
    ? {
      gridTemplateColumns: 'auto 1fr'
    }
    : {
      gridTemplateColumns: '280px 1fr'
    }}
    
  @media screen and (max-width: 840px) {
    display: block;
    overflow-y: auto;
  }
`
const AlertArea = styled.section`
  grid-row: 1;
  grid-column: 2;
`
const Alert = styled.div`
  padding: 10px 10%;
  text-align: center;
  background-color: var(--warning-color);
  color: #000000;
  box-shadow: 0 2px 5px #00000040;
`
const SidebarArea = styled.nav`
  padding: 10px;
  background-color: var(--panel-background-color);
  overflow-y: auto;
  grid-row: 1 / 3;
  grid-column: 1;
`
const MainArea = styled.main`
  overflow-y: auto;
  @media screen and (max-width: 840px) {
    padding: 0;
  }

  grid-row: 2;
  grid-column: 2;
`
const Main = styled.div`
  min-height: 100%;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
`
const Logotype = styled.img`
  height: 16px;
  vertical-align: middle;
  margin-top: -4px;
`
const Button = styled(FormButton)`
  margin-left: 10px;
  padding: 5px 10px;
  border: 1px solid #000000;
  color: #000000;
  font: inherit;
  font-weight: bold;
  outline: none;
  background-color: transparent;

  &:active {
    background-color: #00000040;
    color: #000000;
  }
  &:disabled{
    background-color: #00000080;
    color: #000000;
    pointer-events: none;
  }
`
