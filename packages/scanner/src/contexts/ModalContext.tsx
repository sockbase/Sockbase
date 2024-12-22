import { createContext, useCallback, useState } from 'react'
import { PiX } from 'react-icons/pi'
import styled from 'styled-components'
import FormButton from '../components/Form/FormButton'
import FormItem from '../components/Form/FormItem'
import FormSection from '../components/Form/FormSection'

export interface ModalProps {
  title: string
  type: 'alert' | 'confirm'
  children: React.ReactNode
}

interface Props {
  children: React.ReactNode
}

export const ModalProvider: React.FC<Props> = props => {
  const [isShow, setIsShow] = useState(false)

  const [modalProps, setModalProps] = useState<ModalProps>({
    title: '',
    type: 'alert',
    children: null
  })
  const [handleOK, setHandleOK] = useState(() => () => {})
  const [handleCancel, setHandleCancel] = useState(() => () => {})

  const showModalAsync = useCallback(async (props: ModalProps) => {
    return new Promise<void>((resolve, reject) => {
      setIsShow(true)
      setModalProps(props)
      setHandleOK(() => () => {
        setIsShow(false)
        resolve()
      })
      setHandleCancel(() => () => {
        setIsShow(false)
        reject()
      })
    })
  }, [])

  return (
    <ModalContext.Provider value={showModalAsync}>
      <Container>
        {props.children}
        {isShow && (
          <ModalWrap>
            <Modal
              handleCancel={handleCancel}
              handleOK={handleOK}
              modalProps={modalProps} />
          </ModalWrap>
        )}
      </Container>
    </ModalContext.Provider>
  )
}

const ModalContext = createContext(async (_: ModalProps) => {})

export default ModalContext

interface ModalControlProps {
  modalProps: ModalProps
  handleOK: () => void
  handleCancel: () => void
}
const Modal: React.FC<ModalControlProps> = props => {
  return (
    <ModalContainer>
      <ModalTitleWrap>
        <ModalTitle>{props.modalProps.title}</ModalTitle>
        <ModalClose>
          <ModalCloseButton onClick={props.handleCancel}>
            <PiX />
          </ModalCloseButton>
        </ModalClose>
      </ModalTitleWrap>
      <ModalBody>
        <ModalContent>{props.modalProps.children}</ModalContent>
        <ModalFooter>
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
        </ModalFooter>
      </ModalBody>
    </ModalContainer>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`
const ModalWrap = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`
const ModalContainer = styled.div`
  width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
`
const ModalTitleWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  background-color: #404040;
  color: white;
  border-radius: 10px 10px 0 0;
`
const ModalTitle = styled.div`
  font-weight: bold;
  padding: 10px;
`
const ModalClose = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
const ModalCloseButton = styled.button`
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
const ModalBody = styled.div`
  background-color: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 0 0 10px 10px;
`
const ModalContent = styled.div`
  min-height: 5em;
  color: black;
`
const ModalFooter = styled.div`
  text-align: right;
`
