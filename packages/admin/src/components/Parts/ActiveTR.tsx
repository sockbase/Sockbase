import styled from 'styled-components'

const ActiveTR = styled.tr<{ active: boolean }>`
  background-color: ${props => props.active ? 'var(--row-active-color)' : 'inherit'};
`

export default ActiveTR
