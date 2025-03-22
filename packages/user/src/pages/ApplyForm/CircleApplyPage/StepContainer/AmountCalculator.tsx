import { VoucherAppliedAmount } from 'sockbase'

interface Props {
  paymentAmount: VoucherAppliedAmount | null | undefined
}
const AmountCalculator: React.FC<Props> = props => {
  return (
    <>
      <tr>
        <th>スペース参加費</th>
        <td>{props.paymentAmount ? `${props.paymentAmount.spaceAmount.toLocaleString()}円` : '---' }</td>
      </tr>
      {props.paymentAmount?.voucherAmount && props.paymentAmount?.voucherAmount > 0 && (
        <>
          <tr>
            <th>バウチャー利用額</th>
            <td>{props.paymentAmount ? `${props.paymentAmount.voucherAmount.toLocaleString()}円` : '---' }</td>
          </tr>
          <tr>
            <th>お支払い総額</th>
            <td>
              {props.paymentAmount ? <b>{props.paymentAmount.paymentAmount.toLocaleString()}円</b> : '---' }
            </td>
          </tr>
        </>
      )}
    </>
  )
}

export default AmountCalculator
