import styled from 'styled-components'

interface Props {
  name: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  inlined?: boolean
}
const FormCheckbox: React.FC<Props> = (props) => {
  return (
    <>
      <StyledCheckbox
        name={props.name}
        id={`${props.name}`}
        onChange={e => props.onChange(e.target.checked)}
        checked={props.checked} />
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
  padding: 10px;
  
  ${props => props.inlined && `
    width: auto;
    padding-right: 20px;
  `}

  margin-bottom: 5px;
  padding-left: 44px;
  border: 2px solid var(--outline-color);
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
    top: calc(50% - 10px);
    left: 10px;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    border: 3px solid var(--outline-color);
  }

  &::after {
    position: absolute;
    content: '';
    transform: rotate(-45deg);
    top: calc(50% - 4px);
    left: 16px;
    width: 8px;
    height: 4px;
    border-left: 3px solid var(--text-foreground-color);
    border-bottom: 3px solid var(--text-foreground-color);
    opacity: 0;
  }

  input:checked + & {
    border: 2px solid var(--primary-brand-color);
    background-color: var(--primary-brand-color);
    color: var(--text-foreground-color);
    font-weight: bold;
    &::before {
      border: 3px solid var(--text-foreground-color);
    }
    &::after {
      opacity: 1;
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export default FormCheckbox
