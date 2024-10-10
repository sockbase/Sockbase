
import styled from 'styled-components'
import HeadHelper from '../../libs/Helmet'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
  title?: string
}
const DefaultBaseLayout: React.FC<Props> = (props) => {
  return (
    <Layout>
      <HeadHelper title={props.title} />
      <Container>
        <Wrapper>
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
  /* grid-template-rows: auto 1fr auto; */
  grid-template-rows: 1fr auto;
  background-color: var(--background-body-color);
  color: var(--text-color);
`
const Container = styled.main`
  margin: 40px 25%;
  justify-items: start;

  @media screen and (max-width: 840px) {
    margin: 0;
  }
`

const Wrapper = styled.div`
  padding: 40px;
  background-color: var(--background-color);

  @media screen and (max-width: 840px) {
    padding: 20px;
  }
`
