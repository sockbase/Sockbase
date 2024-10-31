import styled from 'styled-components'

interface Props {
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
}
const FormCheck: React.FC<Props> = (props) => {
  return (
    <>
      <Checkbox
        id={props.name}
        checked={props.checked}
        onChange={e => props.onChange(e.target.checked)} />
      <CheckboxLabel htmlFor={props.name} />
    </>
  )
}

export default FormCheck

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`
const CheckboxLabel = styled.label`
  display: block;
  width: 16px;
  height: 16px;
  border: 1px solid var(--outline-color);
  border-radius: 2px;
  cursor: pointer;
  position: relative;

  &:before {
    content: '';
    display: block;
    width: 7px;
    height: 3px;
    border-left: 2px solid var(--text-color);
    border-bottom: 2px solid var(--text-color);
    position: absolute;
    top: calc(50% - 4px);
    left: calc(50% - 4px);
    transform: rotate(-45deg);
    opacity: 0;
  }

  ${Checkbox}:checked + & {
    border: 1px solid var(--text-color);
    &:before {
      opacity: 1;
    }
  }
`
