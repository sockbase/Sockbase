import { type SockbaseInquiryStatus, type SockbaseApplicationStatus } from 'sockbase'
import styled from 'styled-components'
import { useMemo } from 'react'

interface Props {
  status: SockbaseInquiryStatus
}
const InquiryStatusLabel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (props.status === 0) {
      return 'オープン'
    } else if (props.status === 1) {
      return '対応中'
    } else if (props.status === 2) {
      return 'クローズ'
    }
  }, [props.status])

  return (
    <Container status={props.status}>
      {typeName}
    </Container>
  )
}

export default InquiryStatusLabel

const Container = styled.label<{ status: SockbaseApplicationStatus }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  ${p => {
    if (p.status === 0) {
      return `
        background-color: #20a0f0;
        color: #000000;
      `
    } else if (p.status === 1) {
      return `
        background-color: #32c041;
        color: #000000;
      `
    } else if (p.status === 2) {
      return `
        background-color: #808080;
        color: #000000;
      `
    }
  }};
  color: #ffffff;
`
