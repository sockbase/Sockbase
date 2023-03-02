import { useEffect } from 'react'
import type { SockbaseCircleApplication } from 'sockbase'

interface Props {
  app: SockbaseCircleApplication | undefined
}
const Step2: React.FC<Props> = (props) => {
  useEffect(() => console.log(props.app), [props.app])

  return (
    <>
      {
        props.app && <>
          <h1>入力内容確認</h1>
        </>
      }
    </>
  )
}

export default Step2
