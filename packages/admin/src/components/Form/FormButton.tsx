import styled from 'styled-components'

const FormButton = styled.button<{
  disabled?: boolean
  inlined?: boolean
  color?: 'danger'
}>`
  padding: 10px 20px;

  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

  background-color: var(--brand-black-color);

  ${(props) =>
    props.color === 'danger' ? 'background-color: var(--danger-color);' : ''}

  ${(props) =>
    props.disabled &&
    `
      background-color: var(--disable-color);
      cursor: default;
    `}
`

export default FormButton
