
import styled from 'styled-components'

import LogoSVG from '../../../assets/logo.svg'

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <Copyright>Powered by Sockbase</Copyright>
      <Logo>
        <LogoImage src={LogoSVG} alt="Sockbase Logo" />
      </Logo>
    </StyledFooter>
  )
}

export default Footer

const StyledFooter = styled.footer`
  padding: 50px;
  background-color: #f0f0f0;
  text-align: center;
`
const Copyright = styled.div`
margin-bottom: 40px;
`
const Logo = styled.div``
const LogoImage = styled.img`
  height: 32px;
`
