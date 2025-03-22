import CircleCutUploadForm from '../../../../components/CommonForm/CircleCutUploadForm'
import type { SockbaseApplication, SockbaseApplicationCreateResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  app: SockbaseApplication | undefined
  event: SockbaseEventDocument | null | undefined
  addedResult: SockbaseApplicationCreateResult | undefined
  nextStep: () => void
}
const ThankYouPayment: React.FC<Props> = props => {
  return (
    <>
      <h1>お支払いありがとうございます</h1>
      {props.app?.paymentMethod === 'online'
        ? (
          <p>
            オンライン決済の場合、決済が完了してから 1 日程度で自動的に反映されます。<br />
            3 日経っても反映されない場合は、マイページ内のお問い合わせからご連絡ください。
          </p>
        )
        : props.app?.paymentMethod === 'bankTransfer'
          ? (
            <p>
              銀行振込の場合、お振込みいただいてから 1 週間程度お時間をいただくことがございます。<br />
              1 週間経っても反映されない場合は、マイページ内のお問い合わせからご連絡ください。
            </p>
          )
          : <></>}

      <CircleCutUploadForm
        event={props.event}
        hashId={props.addedResult?.hashId}
        nextStep={props.nextStep} />
    </>
  )
}

export default ThankYouPayment
