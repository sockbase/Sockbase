import styled from 'styled-components'

const FormButton = styled.button<{ inlined?: boolean, color?: 'danger' }>`
  padding: 10px 20px;

  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

  background-color: #404040;

  ${props =>
    props.color === 'danger'
      ? `background-color: var(--danger-color);`
      : ''}
`

export default FormButton
