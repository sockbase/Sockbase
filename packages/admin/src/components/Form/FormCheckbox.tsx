import styled from 'styled-components'
import buttonStyle from '../Mixins/buttonStyle'

interface Props {
  name: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  inlined?: boolean
  disabled?: boolean
}
const FormCheckbox: React.FC<Props> = props => {
  return (
    <>
      <Checkbox
        checked={props.checked}
        disabled={props.disabled}
        id={`${props.name}`}
        name={props.name}
        onChange={e => props.onChange(e.target.checked)} />
      <CheckboxLabel
        htmlFor={props.name}
        inlined={props.inlined}>{props.label}
      </CheckboxLabel>
    </>
  )
}

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const CheckboxLabel = styled.label<{ inlined: boolean | undefined }>`
  ${buttonStyle}
  display: inline-block;
  position: relative;
  padding-left: 35px;
  padding-right: 10px;

  &::before {
    position: absolute;
    content: '';
    top: calc(50% - 10px);
    left: 10px;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    border: 2px solid var(--border-color);
  }

  &::after {
    position: absolute;
    content: '';
    transform: rotate(-45deg);
    top: calc(50% - 4px);
    left: 15px;
    width: 8px;
    height: 4px;
    border-left: 2px solid var(--text-color);
    border-bottom: 2px solid var(--text-color);
    opacity: 0;
  }

  input:checked + & {
    &::before {
      border: 2px solid var(--text-color);
    }
    &::after {
      opacity: 1;
    }
  }

  input:disabled + & {
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
    cursor: not-allowed;
    &::before {
      border: 2px solid var(--disabled-text-color);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export default FormCheckbox
