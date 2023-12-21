import { useRecoilState } from 'recoil'
import ModalState from '../atoms/modalState'
import type React from 'react'

interface IUseModal {
  showModal: (title: string, body: React.ReactNode, footerItems: React.ReactNode[]) => void
  closeModal: () => void
}

const useModal = (): IUseModal => {
  const [, setModal] = useRecoilState(ModalState)

  const showModal = (title: string, body: React.ReactNode, footerItems: React.ReactNode[]): void => {
    setModal({
      title,
      body,
      footerItems
    })
  }

  const closeModal = (): void => {
    setModal(null)
  }

  return {
    showModal,
    closeModal
  }
}

export default useModal
