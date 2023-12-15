import styled from 'styled-components'
import DefaultBaseLayout from '../DefaultBaseLayout/DefaultBaseLayout'

interface Props {
  children: React.ReactNode
  title?: string
  subTitle?: string
  icon?: React.ReactNode
}
const MainLayout: React.FC<Props> = (props) => {
  return (
    <DefaultBaseLayout title={props.title}>
      <BaseContainer>
        <PageTitlePanel>
          {props.icon && <PageTitleIcon>{props.icon}</PageTitleIcon>}
          {props.title && <PageTitle>{props.title}</PageTitle>}
          {props.subTitle && <PageSubTitle>{props.subTitle}</PageSubTitle>}
        </PageTitlePanel>
        <Container>{props.children}</Container>
      </BaseContainer>
    </DefaultBaseLayout>
  )
}

export default MainLayout

const BaseContainer = styled.section`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
`
const PageTitlePanel = styled.section`
  display: grid;
  grid-template-columns: 48px 1fr;
  grid-row: auto auto;
  gap: 0 5px;
  background-color: var(--primary-gray-color);
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
`
const PageTitleIcon = styled.div`
  grid-column: 1;
  grid-row: 1 / 3;

  svg {
    width: 100%;
    height: 100%;
  }
`
const PageTitle = styled.div`
  grid-column: 2;

  font-weight: bold;
  font-size: 1.5em;
`
const PageSubTitle = styled.div`
  grid-column: 2;
`
const Container = styled.div`
  padding: 40px 10%;
  background-color: var(--primary-lightgray-color);
`
