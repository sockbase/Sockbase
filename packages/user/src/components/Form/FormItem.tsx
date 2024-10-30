import styled from 'styled-components'

const FormItem = styled.div<{ $inlined?: boolean }>`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  ${props => props.$inlined && {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
    gap: '5px'
  }}
`

export default FormItem
