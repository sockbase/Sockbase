import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CircleApplicationComplete from '../../../components/CommonComplete/CircleApplicationComplete'
import Alert from '../../../components/Parts/Alert'
import CheckoutComplete from './CheckoutComplete'
import Loading from './Loading'
import type { SockbaseCheckoutResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  checkoutSessionId: string
  checkoutResult: SockbaseCheckoutResult | null | undefined
}
const StepContainer: React.FC<Props> = props => {
  const [step, setStep] = useState(0)
  const [event, setEvent] = useState<SockbaseEventDocument>()

  const stepContainer = useMemo(() => ([
    <CheckoutComplete
      checkoutResult={props.checkoutResult}
      circleApplicationFetchEvent={setEvent}
      circleApplicationNextStep={() => setStep(1)}
      event={event}
      key="thank-you" />,
    <CircleApplicationComplete
      event={event}
      hashId={props.checkoutResult?.applicaitonHashId}
      key="circle-application-complete" />
  ]), [step, props.checkoutResult, event])

  return (
    <>
      {props.checkoutResult === undefined && <Loading />}
      {props.checkoutResult === null && (
        <Alert
          title="エラーが発生しました"
          type="error">
          以下のコードを添えて<Link to="/dashboard/contact/">お問い合わせ</Link>ください。<br />
          <code>{props.checkoutSessionId}</code>
        </Alert>
      )}
      {props.checkoutResult && stepContainer[step]}
    </>
  )
}

export default StepContainer
