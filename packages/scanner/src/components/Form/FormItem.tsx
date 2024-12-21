import styled from 'styled-components'

const FormItem = styled.div<{ $inlined?: boolean }>`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }

  display: flex;
  justify-content: ${({ $inlined }) => ($inlined ? 'flex-end' : 'space-between')};
  align-items: center;
  gap: 5px;
`

export default FormItem
