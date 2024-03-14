import styled from 'styled-components'

const FormHelp = styled.label<{ hasError?: boolean }>`
  display: block;
  margin-top: -2px;
  padding: 5px;
  background-color: var(--background-light-color);
  border: 2px solid var(--outline-color);
  border-radius: 0 0 5px 5px;
  
  transition: background-color 0.1s linear,
              border 0.1s linear;

  *:focus + & {
    background-color: var(--primary-brand-color);
    border: 2px solid var(--primary-brand-color);
  }

  ${props => props.hasError && `
    background-color: #ff2222 !important;
    border: 2px solid #ff2222 !important;
    box-shadow: 0 2px 5px #ff222288;
    color: #ffffff;
  `}
`

export default FormHelp
