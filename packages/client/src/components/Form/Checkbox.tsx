import styled from 'styled-components'

interface Props {
  name: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}
const FormCheckbox: React.FC<Props> = (props) => {
  return (
    <>
      <StyledCheckbox
        name={props.name}
        id={`${props.name}`}
        onChange={e => props.onChange(e.target.checked)}
        checked={props.checked} />
      <StyledCheckboxLabel htmlFor={`${props.name}`}>{props.label}</StyledCheckboxLabel>
    </>
  )
}

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const StyledCheckboxLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  padding: 10px;
  padding-left: 44px;
  border: 2px solid #a0a0a0;
  border-radius: 5px;

  cursor: pointer;
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
    border: 3px solid #808080;
  }
  &::after {
    position: absolute;
    content: '';
    transform: rotate(-45deg);
    top: calc(50% - 4px);
    left: 16px;
    width: 8px;
    height: 4px;
    border-left: 3px solid #ffffff;
    border-bottom: 3px solid #ffffff;
    opacity: 0;
  }

  input:checked + & {
    border: 2px solid #ea6183;
    background-color: #ea6183;
    color: #ffffff;
    font-weight: bold;
    &::before {
      border: 3px solid #ffffff;
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