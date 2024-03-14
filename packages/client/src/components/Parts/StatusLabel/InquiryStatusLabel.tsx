import { useMemo } from 'react'
import styled from 'styled-components'
import { type SockbaseInquiryStatus, type SockbaseApplicationStatus } from 'sockbase'

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
      return 'background-color: var(--info-color);'
    } else if (p.status === 1) {
      return 'background-color: var(--success-color);'
    } else if (p.status === 2) {
      return 'background-color: var(--pending-color);'
    }
  }};

  color: var(--text-foreground-color);
`
