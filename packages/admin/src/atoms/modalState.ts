import React from 'react'
import { atom } from 'recoil'

interface Modal {
  title: string
  body: React.ReactNode
  footerItems: React.ReactNode[]
}

const ModalState = atom<Modal | null>({
  key: 'Modal',
  default: null
})

export default ModalState
