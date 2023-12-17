import styled from 'styled-components'

const FormItem = styled.fieldset<{ inlined?: boolean, right?: boolean }>`
  ${props => props.inlined && ({
    display: 'flex',
    gap: '10px',
    justifyContent: props.right ? 'flex-end' : 'flex-start'
  })}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

export default FormItem
