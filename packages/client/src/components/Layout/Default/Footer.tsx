import React from 'react'
import styled from 'styled-components'

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <Copyright>Powered by Sockbase</Copyright>
      <Logo>Logo</Logo>
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
margin-bottom: 20px;
`
const Logo = styled.div``
