import styled from 'styled-components'

const FormButton = styled.button<{ color?: 'default' }>`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  cursor: pointer;
  transition: background-color 0.1s linear;

${props => props.color === 'default'
    ? {
      backgroundColor: '#e0e0e0',
      color: '#000000',
      '&:active': {
        backgroundColor: '#b3b3b3'
      }
    }
    : {
      backgroundColor: '#ea6183',
      color: '#ffffff',
      '&:active': {
        backgroundColor: '#99334c'
      }
    }}

${props => props.disabled
    ? {
      backgroundColor: '#c0c0c0',
      color: '#808080',
      cursor: 'auto',
      '&:active': {
        backgroundColor: '#c0c0c0',
        color: '#808080'
      }
    }
    : {}}
`

export default FormButton
