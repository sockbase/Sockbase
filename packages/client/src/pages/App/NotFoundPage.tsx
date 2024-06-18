import styled from 'styled-components'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import LinkButton from '../../components/Parts/LinkButton'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'

const NotFoundPage: React.FC = () => {
  return (
    <DefaultBaseLayout title="Page Not Found">
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
    </DefaultBaseLayout>
  )
}

export default NotFoundPage

const StatusCodeHeader = styled.section`
  font-size: 10em;
  font-weight: bold;
  text-align: center;
  color: var(--primary-brand-color);

  @media screen and (max-width: 840px) {
    font-size: 5em;
  }
`

const StatusDescription = styled.p`
  font-size: 2em;
  text-align: center;
  color: var(--text-color);
`
