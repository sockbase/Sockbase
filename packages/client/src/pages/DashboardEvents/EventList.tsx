import { Link } from 'react-router-dom'

const EventList: React.FC = () => {
  return (
    <>
      <ul>
        <li>ねくたりしょん
          <ul>
            <li><Link to="/dashboard/events/shiobana2">第二回しおばな祭</Link></li>
            <li><Link to="/dashboard/events/adaichi1">足立の一歩</Link></li>
            <li><Link to="/dashboard/events/futaste1">ふたばすてっぷ</Link></li>
          </ul>
        </li>
      </ul>
    </>
  )
}

export default EventList
