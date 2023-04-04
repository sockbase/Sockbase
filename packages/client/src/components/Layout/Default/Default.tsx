
import styled from 'styled-components'

import HeadHelper from '../../../libs/Helmet'

import Header from './Header'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
  title?: string
}
const DefaultLayout: React.FC<Props> = (props) => {
  return (
    <StyledLayout>
      <HeadHelper title={props.title} />
      <Header />
      <StyledContainer>{props.children}</StyledContainer>
      <Footer />
    </StyledLayout>
  )
}

export default DefaultLayout

const StyledLayout = styled.section`
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr auto;
`
const StyledContainer = styled.main`
  margin: 40px 25%;
  padding: 40px;
  background-color: #ffffff;
  justify-items: start;

  @media screen and (max-width: 840px) {
    margin: 0;
    padding: 20px;
  }
`
