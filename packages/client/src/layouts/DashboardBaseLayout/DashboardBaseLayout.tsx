import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAtom } from 'jotai'
import { type SockbaseRole } from 'sockbase'
import LogotypeSVG from '../../assets/logotype.svg'
import isSlimAtom from '../../atoms/isSlimAtom'
import FormButton from '../../components/Form/Button'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import HeadHelper from '../../libs/Helmet'
import RequiredLogin from '../../libs/RequiredLogin'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  title: string
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
const DashboardBaseLayout: React.FC<Props> = (props) => {
  const {
    user,
    logoutAsync,
    sendVerifyMailAsync
  } = useFirebase()
  const { systemRole, commonRole } = useRole()
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

  const isValidRole = useMemo((): boolean => {
    if (systemRole === undefined && commonRole === undefined) return false

    if (!props.requireSystemRole && !props.requireCommonRole) {
      return true
    } else if (props.requireSystemRole) {
      return (systemRole ?? 0) >= props.requireSystemRole
    } else if (props.requireCommonRole) {
      return (commonRole ?? 0) >= props.requireCommonRole
    }

    return false
  }, [systemRole, props.requireSystemRole, props.requireCommonRole])

  return (
    <StyledLayout>
      <RequiredLogin />
      {user && isValidRole && <>
        <HeadHelper title={props.title} />
        <StyledHeader>
          <Link to="/dashboard">
            <Logotype src={LogotypeSVG} alt="Sockbase Logotype" />
          </Link>
        </StyledHeader>
        <StyledContainer isSlim={isSlim}>
          {!user.emailVerified && <StyledWrapAlert>
            <Alert>
              メールアドレスの確認が必要です
              <Button
                onClick={handleSendVerifyMail}
                inlined={true}
                disabled={sentVerifyMail}>確認メール送信</Button>
            </Alert>
          </StyledWrapAlert>}
          <StyledSidebar>
            <Sidebar
              logout={handleLogout}
              user={user}
              isSlim={isSlim}
              setSlim={setSlim} />
          </StyledSidebar>
          <StyledWrapMain>
            <StyledMain>{props.children}</StyledMain>
          </StyledWrapMain>
        </StyledContainer>
      </>}
    </StyledLayout>
  )
}

export default DashboardBaseLayout

const StyledLayout = styled.section`
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  background-color: var(--background-body-color);
  color: var(--text-color);
`
const StyledHeader = styled.header`
  padding: 10px;
  background-color: var(--primary-brand-color);
`
const StyledContainer = styled.section<{ isSlim: boolean }>`
  display: grid;
  height: 100%;
  overflow-y: hidden;
  grid-template-rows: auto 1fr;

  ${props => props.isSlim
    ? {
      gridTemplateColumns: 'auto 1fr'
    }
    : {
      gridTemplateColumns: '25% 1fr'
    }}
    
  @media screen and (max-width: 840px) {
    display: block;
    overflow-y: auto;
  }
`
const StyledWrapAlert = styled.section`
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
const StyledSidebar = styled.nav`
  padding: 10px;
  background-color: var(--primary-brand-light-color);
  overflow-y: auto;
  grid-row: 1 / 3;
  grid-column: 1;
`
const StyledWrapMain = styled.main`
  padding: 20px;
  overflow-y: auto;
  @media screen and (max-width: 840px) {
    padding: 0;
  }

  grid-row: 2;
  grid-column: 2;
`
const StyledMain = styled.div`
  min-height: 100%;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background-color: var(--background-color);
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
    pointer-events: none;
  }
`
