import { createContext } from 'react'
export const RouterContext = createContext({
  path: '/',
  navigate: (_: string) => {}
})
