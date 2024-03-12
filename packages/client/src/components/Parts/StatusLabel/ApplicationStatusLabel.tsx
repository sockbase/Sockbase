import { useMemo } from 'react'
import styled from 'styled-components'
import { type SockbaseApplicationStatus } from 'sockbase'

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
        background-color: #b83340;
        color: #000000;
      `
    } else if (p.status === 2) {
      return `
        background-color: #20a0f0;
        color: #000000;
      `
    }
  }};
  color: #ffffff;
`
