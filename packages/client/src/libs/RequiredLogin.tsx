import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '../hooks/useFirebase'

const RequiredLogin: React.FC = () => {
  const { isLoggedIn } = useFirebase()
  const navigate = useNavigate()

  const onChangeLoggedInState: () => void =
    () => {
      if (isLoggedIn === undefined) return
      if (!isLoggedIn) navigate('/')
    }
  useEffect(onChangeLoggedInState, [isLoggedIn])
  return null
}

export default RequiredLogin
