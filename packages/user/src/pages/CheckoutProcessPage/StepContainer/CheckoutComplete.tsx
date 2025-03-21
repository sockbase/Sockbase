import { useEffect, useState } from 'react'
import { MdArrowForward } from 'react-icons/md'
import { Link } from 'react-router-dom'
import TicketApplicationComplete from '../../../components/CommonComplete/TicketApplicationComplete'
import CircleCutUploadForm from '../../../components/CommonForm/CircleCutUploadForm'
import FormButton from '../../../components/Form/FormButton'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import IconLabel from '../../../components/Parts/IconLabel'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import type { SockbaseCheckoutResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  checkoutResult: SockbaseCheckoutResult | null | undefined
  event: SockbaseEventDocument | undefined
  circleApplicationNextStep: () => void
  circleApplicationFetchEvent: (event: SockbaseEventDocument) => void
}
const CheckoutComplete: React.FC<Props> = props => {
  return (
    <div>
      <h1>お支払い情報の確認</h1>
      {props.checkoutResult && (
        <>
          {props.checkoutResult.status === 0 && (
            <Alert
              title="お支払いが完了していません。"
              type="error">
              <Link to="/dashboard/payments">決済履歴</Link> から再度お支払い手続きを行ってください。
            </Alert>
          )}
          {props.checkoutResult.status === 1 && (
            <>
              <ThankYouCheckout />
              {props.checkoutResult?.applicaitonHashId && (
                <CircleApplication
                  event={props.event}
                  fetchEvent={props.circleApplicationFetchEvent}
                  hashId={props.checkoutResult.applicaitonHashId}
                  nextStep={props.circleApplicationNextStep} />
              )}
              {props.checkoutResult?.ticketHashId && (
                <TicketApplicationComplete
                  hashId={props.checkoutResult.ticketHashId}
                  isOnlineCheckout={true} />
              )}
            </>
          )}
          {props.checkoutResult.status === 2 && (
            <Alert
              title="お支払いは完了しています。"
              type="warning">
              お支払い手続きは完了しているため、このページを閉じてください。
            </Alert>
          )}
          {props.checkoutResult.status === -1 && (
            <Alert
              title="エラーが発生しました。"
              type="error">
              お手数ですが、<Link to="/dashboard/contact">こちら</Link> からお問い合わせください。
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

export default CheckoutComplete

const ThankYouCheckout: React.FC = () => {
  return (
    <>
      <h2>お支払いありがとうございました</h2>
      <p>オンラインでのお支払いを確認いたしました。</p>
    </>
  )
}

interface CircleApplicationProps {
  hashId: string
  event: SockbaseEventDocument | undefined
  fetchEvent: (event: SockbaseEventDocument) => void
  nextStep: () => void
}
const CircleApplication: React.FC<CircleApplicationProps> = props => {
  const { getApplicationIdByHashIdAsync, getCircleCutURLByHashIdNullableAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [circleCutURL, setCircleCutURL] = useState<string | null>()

  useEffect(() => {
    getApplicationIdByHashIdAsync(props.hashId)
      .then(appHash => {
        getEventByIdAsync(appHash.eventId)
          .then(props.fetchEvent)
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
    getCircleCutURLByHashIdNullableAsync(props.hashId)
      .then(setCircleCutURL)
      .catch(err => { throw err })
  }, [])

  return (
    <>
      {!circleCutURL
        ? (
          <CircleCutUploadForm
            event={props.event}
            hashId={props.hashId}
            nextStep={props.nextStep} />
        )
        : (
          <FormSection>
            <FormItem>
              <FormButton
                color="primary"
                onClick={props.nextStep}>
                <IconLabel
                  icon={<MdArrowForward />}
                  label="次へ進む" />
              </FormButton>
            </FormItem>
          </FormSection>
        )}
    </>
  )
}
