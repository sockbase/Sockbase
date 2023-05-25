import styled from 'styled-components'

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 2px solid #a0a0a0;
  border-radius: 5px 5px 0 0;

  transition: background-color 0.1s linear,
              border 0.1s linear;

  &:focus {
    border: 2px solid #ea6183;
    outline: none;
  }

  &:last-child {
  border-radius: 5px;
  }
`

export default FormSelect
