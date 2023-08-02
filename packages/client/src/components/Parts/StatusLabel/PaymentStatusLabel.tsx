import { useMemo } from 'react'
import styled from 'styled-components'
import type { PaymentStatus } from 'sockbase'

interface Props {
  status: PaymentStatus | undefined
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
    <Container status={props.status ?? 0}>
      {statusText}
    </Container>
  )
}

export default PaymentStatusLabel

const Container = styled.label<{ status: PaymentStatus }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  ${p => {
    if (p.status === 0) {
      return `
        background-color: #808080;
        color: #000000;
      `
    } else if (p.status === 1) {
      return `
        background-color: #32c041;
        color: #000000;
      `
    } else if (p.status === 2 || p.status === 3) {
      return `
        background-color: #d31f1f;
        color: #000000;
      `
    }
  }};
  color: #ffffff;
`
