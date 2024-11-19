import { css } from 'styled-components'

const buttonStyle = css<{ disabled?: boolean }>`
  padding: 5px 20px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: inherit;
  font: inherit;
  color: var(--text-color);
  background-color: var(--inputfield-background-color);
  cursor: pointer;
  user-select: none;
  transition: border 0.2s, background-color 0.1s;

  &:hover {
    border: 1px solid var(--text-color);
  }

  &:active {
    background-color: var(--brand-background-active-color);
  }

  &[disabled] {
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
    pointer-events: none;
  }
`

export default buttonStyle
