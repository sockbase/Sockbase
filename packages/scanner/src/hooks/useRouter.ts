import { useContext } from 'react'
import RouterContext from '../contexts/RouterContext'

interface IUseRouter {
  path: string
  navigate: (path: string) => void
}

export const useRouter = (): IUseRouter => {
  return useContext(RouterContext)
}

export default useRouter
