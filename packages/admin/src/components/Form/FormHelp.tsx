import styled from 'styled-components'

const FormHelp = styled.div`
  font-size: 0.8em;
  color: var(--text-light-color);

  transition: color 0.1s linear;

  *:focus + & {
    color: var(--text-color);
  }
`

export default FormHelp
