import { useRecoilState } from 'recoil'
import styled from 'styled-components'
import ModalState from '../../../atoms/modalState'

const ModalProvider: React.FC = () => {
  const [modal] = useRecoilState(ModalState)
  return (
    <>
      {modal && <ModalWrapper>
        <ModalContainer>
          <ModalHeader>{modal.title}</ModalHeader>
          <ModalContent>{modal.body}</ModalContent>
          <ModalFooter>{modal.footerItems.map(f => f)}</ModalFooter>
        </ModalContainer>
      </ModalWrapper>}
    </>
  )
}

export default ModalProvider

const ModalWrapper = styled.div`
  position: fixed;
  background-color: #00000080;
  top: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
`

const ModalContainer = styled.div`
  width: 50%;
  border-radius: 5px;
`

const ModalHeader = styled.div`
  padding: 10px;
  background-color: #404040;
  color: var(--brand-white-color);
  font-weight: bold;
  border-radius: 5px 5px 0 0;
`
const ModalContent = styled.div`
  padding: 20px 10px;
  background-color: var(--brand-white-color);
`
const ModalFooter = styled.div`
  padding: 10px;
  background-color: var(--primary-gray-color);
  border-radius: 0 0 5px 5px;
`
