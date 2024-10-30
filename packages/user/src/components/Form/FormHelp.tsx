import styled from 'styled-components'

const FormHelp = styled.div<{ hasError?: boolean }>`
  display: block;
  margin-top: -1px;
  padding: 5px;
  background-color: var(--panel-background-color);
  border: 1px solid var(--border-color);
  border-radius: 0 0 5px 5px;

  font-size: 0.8em;
  
  transition: background-color 0.1s linear,
              border 0.1s linear;

  *:focus + & {
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
    color: var(--white-color);
  }

  ${props => props.hasError && `
    background-color: #ff2222 !important;
    border: 1px solid #ff2222 !important;
    box-shadow: 0 2px 5px #ff222288;
    color: #ffffff;
  `}
`

export default FormHelp
