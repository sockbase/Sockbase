import { atom } from 'recoil'

interface Notification {
  id: string
  message: string
}

const notificationState = atom<Notification[]>({
  key: 'notification',
  default: []
})

export default notificationState
