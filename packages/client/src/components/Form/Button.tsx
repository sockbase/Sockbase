import styled from 'styled-components'

const FormButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #ea6183;
  border-radius: 5px;
  border: none;

  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

  &:active {
    background-color: #99334c;
  }
`

export default FormButton
