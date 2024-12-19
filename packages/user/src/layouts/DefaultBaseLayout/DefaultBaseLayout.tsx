import styled from 'styled-components'
import HeadHelper from '../../libs/Helmet'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
  title?: string
  isZeroPadding?: boolean
}
const DefaultBaseLayout: React.FC<Props> = props => {
  return (
    <Layout>
      <HeadHelper title={props.title} />
      <Container>
        <Wrapper $isZeroPadding={props.isZeroPadding ?? false}>
          {props.children}
        </Wrapper>
      </Container>
      <Footer />
    </Layout>
  )
}

export default DefaultBaseLayout

const Layout = styled.section`
  display: grid;
  min-height: 100%;
  grid-template-rows: 1fr auto;
  background-color: var(--panel-background-color);
`
const Container = styled.main`
  margin: 40px 25%;

  @media screen and (max-width: 840px) {
    margin: 0;
  }
`
const Wrapper = styled.div<{ $isZeroPadding: boolean }>`
  padding: ${props => !props.$isZeroPadding ? '40px' : 0};
  background-color: var(--body-background-color);
  @media screen and (max-width: 840px) {
    padding: ${props => !props.$isZeroPadding ? '20px' : 0};
  }
`
