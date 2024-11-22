import { useState, useEffect, useMemo } from 'react'

interface UseWindowDimension {
  isSmallDisplay: boolean | null
  width: number
  height: number
}
const useWindowDimension = (): UseWindowDimension => {
  const isClient = typeof window === 'object'

  const getWindowDimension = (): {
    width: number | undefined
    height: number | undefined
  } => ({
    width: (isClient && window?.innerWidth) || undefined,
    height: (isClient && window?.innerHeight) || undefined
  })

  const [windowDimension, setWindowDimension] = useState<{
    width: number | undefined
    height: number | undefined
  }>()

  const isSmallDisplay = useMemo(() => {
    if (!windowDimension) return null
    return (windowDimension.width || 0) <= 840
  }, [windowDimension])

  useEffect(() => {
    const onResize = (): void => {
      const result = getWindowDimension()
      setWindowDimension(result)
    }

    onResize()

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    isSmallDisplay,
    width: windowDimension?.width || 0,
    height: windowDimension?.height || 0
  }
}

export default useWindowDimension
