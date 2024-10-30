import styled from 'styled-components'

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
      <StyledCheckbox
        name={props.name}
        id={`${props.name}`}
        onChange={e => props.onChange(e.target.checked)}
        checked={props.checked}
        disabled={props.disabled} />
      <StyledCheckboxLabel htmlFor={props.name} inlined={props.inlined}>{props.label}</StyledCheckboxLabel>
    </>
  )
}

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const StyledCheckboxLabel = styled.label<{ inlined: boolean | undefined }>`
  display: inline-block;
  width: 100%;

  min-height: 2.5em;
  padding: 5px 10px;
  
  ${props => props.inlined && `
    width: auto;
    padding-right: 20px;
  `}

  padding-left: 44px;
  border: 1px solid var(--outline-color);
  border-radius: 5px;
  color: var(--text-color);

  cursor: pointer;
  user-select: none;

  transition: background-color 0.1s linear,
              border 0.1s linear,
              opacity 0.1s linear;

  position: relative;
  
  &::before {
    position: absolute;
    content: '';
    top: calc(50% - 9px);
    left: 12px;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    border: 1px solid var(--outline-color);
  }

  &::after {
    position: absolute;
    content: '';
    transform: rotate(-45deg);
    top: calc(50% - 4px);
    left: 16px;
    width: 8px;
    height: 4px;
    border-left: 2px solid var(--text-foreground-color);
    border-bottom: 2px solid var(--text-foreground-color);
    opacity: 0;
  }

  input:checked + & {
    border: 1px solid var(--primary-brand-color);
    background-color: var(--primary-brand-color);
    color: var(--text-foreground-color);
    font-weight: bold;
    &::before {
      border: 1px solid var(--text-foreground-color);
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
      border: 1px solid var(--outline-color);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export default FormCheckbox
