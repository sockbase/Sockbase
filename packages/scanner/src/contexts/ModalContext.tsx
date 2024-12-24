import { createContext, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from '../components/Parts/Modal'

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
    else if (e.key === 'Enter') {
      handleOK()
    }
  }, [handleOK, handleCancel])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

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
