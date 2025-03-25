import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import useFirebase from '../hooks/useFirebase'

const RequiredLogin: React.FC = () => {
  const { isLoggedIn } = useFirebase()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect((): void => {
    if (isLoggedIn === undefined) return
    if (!isLoggedIn) {
      const searchParams = location.search
      navigate(`/?redirect=${encodeURIComponent(location.pathname + searchParams)}`, { replace: true })
    }
  }, [isLoggedIn])

  return null
}

export default RequiredLogin
