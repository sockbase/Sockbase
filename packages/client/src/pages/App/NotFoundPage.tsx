import styled from 'styled-components'
import DefaultLayout from '../../components/Layout/Default/Default'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import LinkButton from '../../components/Parts/LinkButton'

const NotFoundPage: React.FC = () => {
  return (
    <DefaultLayout title="Page Not Found">
      <StatusCodeHeader>
        404
      </StatusCodeHeader>
      <StatusDescription>
        ページが見つかりませんでした
      </StatusDescription>
      <FormSection>
        <FormItem>
          <LinkButton to="/" color="default">トップへ戻る</LinkButton>
        </FormItem>
      </FormSection>
    </DefaultLayout>
  )
}

export default NotFoundPage

const StatusCodeHeader = styled.section`
  font-size: 10em;
  font-weight: bold;
  text-align: center;
  color: var(--primary-color);

  @media screen and (max-width: 840px) {
    font-size: 5em;
  }
`

const StatusDescription = styled.p`
  font-size: 2em;
  text-align: center;
  color: #404040;
`
