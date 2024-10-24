import { css } from 'styled-components'

const buttonStyle = css`
  padding: 5px 20px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: inherit;
  font: inherit;
  color: var(--text-foreground-color);
  background-color: var(--background-color);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s;

  &:active {
    background-color: var(--background-light2-color);
  }

  &:disabled {
    background-color: var(--background-disabled-color);
    color: var(--text-disabled-color);
  }
`

export default buttonStyle
