import { type SockbaseApplicationStatus } from 'sockbase'
import styled from 'styled-components'
import { useMemo } from 'react'

interface Props {
  status: SockbaseApplicationStatus | undefined
}
const ApplicationStatusLabel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (props.status === 0) {
      return '仮申し込み'
    } else if (props.status === 1) {
      return 'キャンセル済み'
    } else if (props.status === 2) {
      return '申し込み確定'
    }
  }, [props.status])

  return (
    <Container status={props.status ?? 0}>
      {typeName}
    </Container>
  )
}

export default ApplicationStatusLabel

const Container = styled.label<{ status: SockbaseApplicationStatus }>`
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
        background-color: #d31f1f;
        color: #000000;
      `
    } else if (p.status === 2) {
      return `
        background-color: #32c041;
        color: #000000;
      `
    }
  }};
  color: #ffffff;
`