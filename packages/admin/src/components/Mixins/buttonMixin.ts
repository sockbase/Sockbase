import { css } from 'styled-components'

const buttonMixin = css<{
  disabled?: boolean
  inlined?: boolean
  color?: 'danger' | 'info'
}>`
  ${props => !props.inlined && {
    display: 'block',
    width: '100%'
  }}

  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

  background-color: var(--brand-black-color);

  ${(props) => props.color && `background-color: var(--${props.color}-color);`}

  ${(props) =>
    props.disabled &&
    `
      background-color: var(--disable-color);
      cursor: default;
    `}
`

export default buttonMixin
