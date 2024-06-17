import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import LogotypeSVG from '../../../assets/logotype.svg'
import useFirebase from '../../hooks/useFirebase'

const Header: React.FC = () => {
  const { user, logout } = useFirebase()
  const loggedInState = useMemo(() => {
    if (user === undefined) {
      return '認証中'
    } else if (user) {
      return (
        <span onClick={logout}>
          {user.email} としてログイン中
        </span>
      )
    } else {
      return <Link to="/">未ログイン</Link>
    }
  }, [user])

  return (
    <StyledHeader>
      <Logo>
        <Logotype src={LogotypeSVG} alt="Sockbase Logotype" /> 開発用ヘッダー
      </Logo>
      <Account>
        {loggedInState}
      </Account>
    </StyledHeader>
  )
}

const StyledHeader = styled.header`
  padding: 10px;
  display: grid;
  grid-template-columns: auto auto;
  background-color: #404040;
  color: #ffffff;

  @media screen and (max-width: 840px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto;
  }
`
const Logo = styled.div``
const Logotype = styled.img`
  height: 16px;
`
const Account = styled.div`
  text-align: right;
`

export default Header
