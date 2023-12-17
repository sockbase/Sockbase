import { useRecoilState } from 'recoil'
import notificationState from '../atoms/notificationState'

const useNotification = () => {
  const [_, setNotifications] = useRecoilState(notificationState)

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
