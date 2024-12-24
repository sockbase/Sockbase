import { PiX } from 'react-icons/pi'
import styled from 'styled-components'
import { ModalProps } from '../../contexts/ModalContext'
import FormButton from '../Form/FormButton'
import FormItem from '../Form/FormItem'
import FormSection from '../Form/FormSection'

interface ModalControlProps {
  modalProps: ModalProps
  handleOK: () => void
  handleCancel: () => void
}

const Modal: React.FC<ModalControlProps> = props => {
  return (
    <Container>
      <TitleWrap>
        <Title>{props.modalProps.title}</Title>
        <Close>
          <CloseButton onClick={props.handleCancel}>
            <PiX />
          </CloseButton>
        </Close>
      </TitleWrap>
      <Body>
        <Content>{props.modalProps.children}</Content>
        <Footer>
          <FormSection>
            <FormItem $inlined>
              <FormButton onClick={props.handleOK}>
                {props.modalProps.type === 'confirm' ? 'はい' : 'OK'}
              </FormButton>
              {props.modalProps.type === 'confirm' && (
                <FormButton onClick={props.handleCancel}>
                  いいえ
                </FormButton>
              )}
            </FormItem>
          </FormSection>
        </Footer>
      </Body>
    </Container>
  )
}

export default Modal

const Container = styled.div`
  width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
`
const TitleWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  background-color: #404040;
  color: white;
  border-radius: 10px 10px 0 0;
`
const Title = styled.div`
  font-weight: bold;
  padding: 10px;
`
const Close = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
const CloseButton = styled.button`
  width: calc(28px + 10px);
  height: calc(28px + 10px);
  background-color: transparent;
  border: none;
  padding: 10px;
  svg {
    color: white;
    width: 100%;
    height: 100%;
  }
`
const Body = styled.div`
  background-color: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 0 0 10px 10px;
`
const Content = styled.div`
  min-height: 5em;
  color: black;
`
const Footer = styled.div`
  text-align: right;
`
