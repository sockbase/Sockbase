import { useState } from 'react'

interface IUseRouter {
  path: string
  navigate: (path: string) => void
}

export const useRouter = (): IUseRouter => {
  const [path, setPath] = useState('/')

  return {
    path,
    navigate: setPath
  }
}

export default useRouter
