import { useState } from "react"
import StepProgress from "../../../Parts/StepProgress"
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from "sockbase"

const stepProgresses = ['入力', '確認', '完了']

interface Props {
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
}
const StepContainer: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)

  return (
    <>
      <h1>{props.store.storeName} チケット受け取りページ</h1>

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step - 1
        }))
      } />
    </>
  )
}

export default StepContainer
