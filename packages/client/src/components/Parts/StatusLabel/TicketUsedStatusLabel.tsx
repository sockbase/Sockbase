import styled from 'styled-components'
import { useMemo } from 'react'

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
      return `
        background-color: #32c041;
        color: #000000;
      `
    } else {
      return `
        background-color: #808080;
        color: #000000;
      `
    }
  }};
  color: #ffffff;
`