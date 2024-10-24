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
const FormCheckbox: React.FC<Props> = (props) => {
  return (
    <>
      <Checkbox
        name={props.name}
        id={`${props.name}`}
        onChange={e => props.onChange(e.target.checked)}
        checked={props.checked}
        disabled={props.disabled} />
      <CheckboxLabel htmlFor={props.name} inlined={props.inlined}>{props.label}</CheckboxLabel>
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
    border: 2px solid var(--outline-color);
  }

  &::after {
    position: absolute;
    content: '';
    transform: rotate(-45deg);
    top: calc(50% - 4px);
    left: 15px;
    width: 8px;
    height: 4px;
    border-left: 2px solid var(--text-foreground-color);
    border-bottom: 2px solid var(--text-foreground-color);
    opacity: 0;
  }

  input:checked + & {
    &::before {
      border: 2px solid var(--text-foreground-color);
    }
    &::after {
      opacity: 1;
    }
  }

  input:disabled + & {
    border: 1px solid var(--outline-color);
    background-color: var(--background-disabled-color);
    color: var(--text-disabled-color);
    cursor: not-allowed;
    &::before {
      border: 2px solid var(--outline-color);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export default FormCheckbox
