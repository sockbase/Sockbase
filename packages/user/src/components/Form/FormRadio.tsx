import styled from 'styled-components'

interface Props {
  name: string
  values: Array<{
    value: string
    text: string
    checked?: boolean
  }>
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}
const FormRadio: React.FC<Props> = (props) => {
  return (
    <>
      {props.values.map(opt => <RadioItem key={`${props.name}-${opt.value}`}>
        <Radio
          name={props.name}
          id={`${props.name}-${opt.value}`}
          value={opt.value}
          onChange={e => props.onChange(e.target.value)}
          checked={props.value === opt.value}
          defaultChecked={opt.checked} />
        <RadioLabel
          htmlFor={`${props.name}-${opt.value}`}
          hasError={props.hasError}>{opt.text}</RadioLabel>
      </RadioItem>)}
    </>
  )
}

const RadioItem = styled.div`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
`

const Radio = styled.input.attrs({ type: 'radio' })`
  display: none;
`

const RadioLabel = styled.label<{ hasError?: boolean }>`
  display: block;
  min-height: 2.5em;
  padding: 5px 10px;
  padding-left: 44px;
  border: 1px solid var(--border-color);
  border-radius: 5px;

  background-color: var(--inputfield-background-color);

  cursor: pointer;
  transition: background-color 0.1s linear,
              border 0.1s linear,
              opacity 0.1s linear;

  &:hover {
    border: 1px solid var(--primary-color);
  }

  position: relative;

  ${props => props.hasError && {
    border: '1px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}

  &::before {
    position: absolute;
    content: '';
    top: calc(50% - 9px);
    left: 12px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--outline-color);
  }

  &::after {
    position: absolute;
    content: '';
    top: calc(50% - 5px);
    left: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--white-color);
    opacity: 0;
  }

  input:checked + & {
    background-color: var(--primary-color);
    color: var(--white-color);
    font-weight: bold;
    &::before {
      border: 1px solid var(--white-color);
    }
    &::after {
      opacity: 1;
    }
  }
`

export default FormRadio
