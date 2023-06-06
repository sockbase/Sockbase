import styled from 'styled-components'

import FormSection from '../../Form/FormSection'
import FormItem from '../../Form/FormItem'
import LinkButton from '../../Parts/LinkButton'

const NotFound: React.FC = () => {
  return (
    <>
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
    </>
  )
}

export default NotFound

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
