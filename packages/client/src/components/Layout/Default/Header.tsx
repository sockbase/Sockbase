import styled from 'styled-components'

import useFirebase from '../../../hooks/useFirebase'

import LogotypeSVG from '../../../assets/logotype.svg'

const Header: React.FC = () => {
  const { user } = useFirebase()

  return (
    <StyledHeader>
      <Logo>
        <Logotype src={LogotypeSVG} alt="Sockbase Logotype" />
      </Logo>
      <Account>
        {user === undefined
          ? '認証中'
          : user?.email
            ? `${user.email} としてログイン中`
            : '未ログイン'
        }
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
`
const Logo = styled.div``
const Logotype = styled.img`
  height: 16px;
`
const Account = styled.div`
  text-align: right;
`

export default Header
