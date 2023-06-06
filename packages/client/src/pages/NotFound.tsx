import DefaultLayout from '../components/Layout/Default/Default'
import NotFoundComponent from '../components/pages/App/NotFound'

const NotFound: React.FC = () => {
  return (
    <DefaultLayout title="Page Not Found">
      <NotFoundComponent />
    </DefaultLayout>
  )
}

export default NotFound
