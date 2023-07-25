import { useMemo } from 'react'
import styled from 'styled-components'
import type { PaymentStatus } from 'sockbase'

interface Props {
  status: PaymentStatus
}
const PaymentStatusLabel: React.FC<Props> = (props) => {
  const statusText = useMemo(() => {
    switch (props.status) {
      case 0:
        return 'お支払い待ち'

      case 1:
        return 'お支払い済み'

      case 2:
        return '返金済み'

      case 3:
        return 'お支払い失敗'
    }
  }, [props.status])

  return (
    <Label>{statusText}</Label>
  )
}

export default PaymentStatusLabel

const Label = styled.label`
  cursor: inherit;
`
