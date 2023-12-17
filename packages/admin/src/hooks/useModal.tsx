import { useRecoilState } from 'recoil'
import ModalState from '../atoms/modalState'
import React from 'react'

const useModal = () => {
  const [_, setModal] = useRecoilState(ModalState)

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
