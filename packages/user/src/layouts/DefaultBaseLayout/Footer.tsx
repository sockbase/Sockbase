import styled from 'styled-components'
import LogotypeSVG from '../../assets/logotype.svg'

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <Logo>
        <LogoImage
          alt="Powered by Sockbase"
          src={LogotypeSVG} />
      </Logo>
    </StyledFooter>
  )
}

export default Footer

const StyledFooter = styled.footer`
  padding: 10px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background-color: var(--brand-background-color);
`
const Logo = styled.div`
  text-align: right;
  font-size: 0;
`
const LogoImage = styled.img`
  height: 16px;
  vertical-align: middle;
`
