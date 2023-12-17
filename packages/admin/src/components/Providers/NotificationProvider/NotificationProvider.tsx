import styled from 'styled-components'
import { useRecoilState } from 'recoil'
import notificationState from '../../../atoms/notificationState'
import NotificationCard from './NotificationCard'

const NotificationProvider: React.FC = () => {
  const [notifications, setNotification] = useRecoilState(notificationState)

  const handleRemove = (id: string): void => {
    setNotification(s => (s.filter(n => n.id !== id)))
  }

  return (
    <>
      <NotificationWrapper>
        {notifications.map(n =>
          <NotificationCard key={n.id} message={n.message} handleRemove={() => handleRemove(n.id)} />)}
      </NotificationWrapper>
    </>
  )
}

export default NotificationProvider

const NotificationWrapper = styled.div`
  padding: 20px;
  gap: 10px;
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  flex-flow: column;

  pointer-events: none;
  /* overflow: hidden; */
`
