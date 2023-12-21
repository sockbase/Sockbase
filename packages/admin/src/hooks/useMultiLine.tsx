import { Fragment, useCallback } from 'react'

interface IUseMultiLine {
  convertMultiLine: (rawBody: string) => React.ReactNode
}

const useMultiLine = (): IUseMultiLine => {
  const convertMultiLine = useCallback((rawBody: string): React.ReactNode => {
    const body = rawBody.split('\\n')
    return body.map((l, k) => (
      <Fragment key={k}>
        {l}
        {k + 1 !== body.length && <br />}
      </Fragment>
    ))
  }, [])

  return {
    convertMultiLine
  }
}

export default useMultiLine
