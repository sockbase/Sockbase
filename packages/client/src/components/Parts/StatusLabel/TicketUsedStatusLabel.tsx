import { useMemo } from 'react'
import styled from 'styled-components'

interface Props {
  status: boolean | undefined
}
const TicketUsedStatusLabel: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (props.status) {
      return '使用済み'
    } else {
      return '未使用'
    }
  }, [props.status])

  return (
    <Container status={props.status ?? false}>
      {typeName}
    </Container>
  )
}

export default TicketUsedStatusLabel

const Container = styled.label<{ status: boolean }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  ${p => {
    if (p.status) {
      return 'background-color: var(--danger-color);'
    } else {
      return 'background-color: var(--pending-color);'
    }
  }};

  color: var(--text-foreground-color);
`
