import { css } from 'styled-components'

type ColorType = 'default' | 'primary' | 'info' | 'danger'

const buttonStyle = css<{ color?: ColorType, disabled?: boolean }>`
  display: inline-block;
  padding: 10px 40px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.1s, border 0.2s;
  text-decoration: none;

  color: var(--text-color);
  background-color: var(--inputfield-background-color);
  &:active {
    background-color: var(--inputfield-active-background-color);
  }
  &:hover {
    border: 1px solid var(--brand-color);
  }

  ${props => props.color && `
    color: var(--white-color);
    background-color: var(--${props.color}-color);
    &:active {
      background-color: var(--${props.color}-active-color);
    }
  `}

  &:disabled {
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
    cursor: auto;
    pointer-events: none;
  }
`

export default buttonStyle
