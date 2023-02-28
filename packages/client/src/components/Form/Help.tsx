import styled from 'styled-components'

const FormHelp = styled.label`
  display: block;
  margin-top: -2px;
  padding: 5px;
  background-color: #a0a0a080;
  border: 2px solid #a0a0a080;
  border-radius: 0 0 5px 5px;
  
  transition: background-color 0.1s linear,
              border 0.1s linear;

  input:focus + & {
    background-color: #ea618380;
    border: 2px solid #ea618380;
  }
`

export default FormHelp
