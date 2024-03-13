import styled from 'styled-components'

const FormItem = styled.fieldset<{ inlined?: boolean }>`
  ${props => props.inlined && ({
    display: 'flex',
    gap: '10px'
  })}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (max-width: 840px) {
    flex-flow: column;
  }
`

export default FormItem
