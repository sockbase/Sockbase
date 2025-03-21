import { useMemo, useState } from 'react'
import CircleApplicationComplete from '../../../components/CommonComplete/CircleApplicationComplete'
import CheckoutComplete from './CheckoutComplete'
import Loading from './Loading'
import type { SockbaseCheckoutResult, SockbaseEventDocument } from 'sockbase'

interface Props {
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
      {props.checkoutResult && stepContainer[step]}
    </>
  )
}

export default StepContainer
