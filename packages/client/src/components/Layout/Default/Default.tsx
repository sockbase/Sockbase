
import styled from 'styled-components'

import HeadHelper from '../../../libs/Helmet'

import Footer from './Footer'

interface Props {
  children: React.ReactNode
  title?: string
}
const DefaultLayout: React.FC<Props> = (props) => {
  return (
    <StyledLayout>
      <HeadHelper title={props.title} />
      <StyledContainer>{props.children}</StyledContainer>
      <Footer />
    </StyledLayout>
  )
}

export default DefaultLayout

const StyledLayout = styled.div({
  display: 'grid',
  height: '100%',
  gridTemplateRows: '1fr auto'
})
const StyledContainer = styled.main`
  padding: 40px 25%;

  @media screen and (max-width: 840px) {
    padding: 20px;
  }
`
