import styled from 'styled-components'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import { MdChat, MdSend } from 'react-icons/md'

const SupportChat: React.FC = () => {
  return (
    <DashboardLayout title="サポートチャット">
      <ContainerWrap>
        <Breadcrumbs>
          <li><Link to="/dashboard">マイページ</Link></li>
        </Breadcrumbs>
        <PageTitle title="サポートチャット" description="緊急の対応が必要な場合はこちらからお問い合わせください" icon={<MdChat />} />

        <ChatContainer>
          <MessagesArea>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
            <Message>
              <MessageBody>ハロー・ワールド</MessageBody>
              <MessageMeta>2023/08/10 19:39:14</MessageMeta>
            </Message>
          </MessagesArea>
          <InputArea>
            <InputField />
            <SendButton><MdSend /></SendButton>
          </InputArea>
        </ChatContainer>
      </ContainerWrap>
    </DashboardLayout>
  )
}

export default SupportChat

const ContainerWrap = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
`

const ChatContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  justify-content: stretch;
`

const MessagesArea = styled.section`
  max-height: 100%;
  overflow-y: scroll;
`

const Message = styled.article`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 10px;
  }
`
const MessageBody = styled.div``
const MessageMeta = styled.div``

const InputArea = styled.section`
  display: grid;
  grid-template-columns: 1fr 48px;
  gap: 10px;
`
const InputField = styled.input`
  border: 2px solid #808080;
  border-radius: 5px;
  font-size: 16px;
`
const SendButton = styled.button`
  border: none;
  border-radius: 5px;
  background-color: var(--primary-color);
  color: #ffffff;
  cursor: pointer;
  &:active {
    background-color: var(--primary-color-active);
  }
`
