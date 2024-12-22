import { useContext } from 'react'
import ModalContext, { ModalProps } from '../contexts/ModalContext'

interface IUseModal {
  showModalAsync: (props: ModalProps) => Promise<void>
}

const useModal = (): IUseModal => {
  const showModalAsync = useContext(ModalContext)
  return {
    showModalAsync
  }
}

export default useModal
