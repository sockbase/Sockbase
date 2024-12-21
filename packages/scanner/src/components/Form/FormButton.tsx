import styled from 'styled-components'

const FormButton = styled.button`
  padding: 5px 20px;
  border: 1px solid #c0c0c0;
  background-color: #ffffff;
  color: #404040;
  border-radius: 5px;
  font-size: 1rem;

  transition: background-color 0.2s;

  &:active {
    background-color: #f0f0f0;
  }
`

export default FormButton
