import { createContext, useState } from 'react'

const RouterContext = createContext({
  path: '/',
  navigate: (_: string) => {}
})

interface Props {
  children: React.ReactNode
}

export const RouterProvider: React.FC<Props> = props => {
  const [path, setPath] = useState('/')
  const navigate = (path: string) => {
    setPath(path)
  }

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {props.children}
    </RouterContext.Provider>
  )
}

export default RouterContext
