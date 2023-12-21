import { useRecoilState } from 'recoil'
import notificationState from '../atoms/notificationState'

interface IUseNotification {
  addNotification: (message: string) => void
}

const useNotification = (): IUseNotification => {
  const [, setNotifications] = useRecoilState(notificationState)

  const addNotification = (message: string): void => {
    const now = new Date().getTime()
    setNotifications(s => ([...s, {
      id: now.toString(),
      message
    }]))
  }

  return {
    addNotification
  }
}

export default useNotification
