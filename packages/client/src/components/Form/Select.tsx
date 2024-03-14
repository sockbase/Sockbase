import styled from 'styled-components'

const FormSelect = styled.select<{ hasError?: boolean }>`
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

  ${props => props.hasError && {
    border: '2px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}

`

export default FormSelect
