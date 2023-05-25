import styled from 'styled-components'

const FormButton = styled.button<{ color?: 'default' | 'info' | 'danger' }>`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

${props => {
    if (props.color === 'default') {
      return {
        backgroundColor: '#e0e0e0',
        color: '#000000',
        '&:active': {
          backgroundColor: '#b3b3b3'
        }
      }
    } else if (props.color === 'info') {
      return {
        backgroundColor: '#20a0f0',
        '&:active': {
          backgroundColor: '#1080e0'
        }
      }
    } else {
      return {
        backgroundColor: '#ea6183',
        '&:active': {
          backgroundColor: '#99334c'
        }
      }
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
