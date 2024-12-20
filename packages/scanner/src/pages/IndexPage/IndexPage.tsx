import { useContext } from 'react'
import { RouterContext } from '../../contexts/RouterContext'

const IndexPage: React.FC = () => {
  const router = useContext(RouterContext)

  return (
    <>
      <h1>Index Page</h1>
      <span onClick={() => router.navigate('/scanner')}>test</span>
    </>
  )
}

export default IndexPage
