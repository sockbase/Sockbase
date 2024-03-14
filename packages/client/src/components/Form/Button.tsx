import styled from 'styled-components'

const FormButton = styled.button<{ inlined?: boolean, color?: 'default' | 'info' | 'danger' }>`
  ${props => !props.inlined && 'width: 100%;'}
  
  padding: 10px 40px;
  
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: var(--text-foreground-color);

  cursor: pointer;
  transition: background-color 0.1s linear;

${props => {
    if (props.color === 'default') {
      return {
        backgroundColor: 'var(--background-dark-color)',
        color: 'var(--text-color)',
        '&:active': {
          backgroundColor: 'var(--background-dark-active-color)'
        }
      }
    } else if (props.color === 'info') {
      return {
        backgroundColor: 'var(--info-color)',
        '&:active': {
          backgroundColor: 'var(--info-active-color)'
        }
      }
    } else if (props.color === 'danger') {
      return {
        backgroundColor: 'var(--danger-color)',
        '&:active': {
          backgroundColor: 'var(--danger-active-color)'
        }
      }
    } else {
      return {
        backgroundColor: 'var(--primary-brand-color)',
        '&:active': {
          backgroundColor: 'var(--primary-brand-active-color)'
        }
      }
    }
  }}

${props => props.disabled
    ? {
      backgroundColor: 'var(--background-disabled-color)',
      color: 'var(--text-disabled-color)',
      cursor: 'auto',
      '&:active': {
        backgroundColor: 'var(--background-disabled-color)',
        color: 'var(--text-disabled-color)'
      }
    }
    : {}}
`

export default FormButton
