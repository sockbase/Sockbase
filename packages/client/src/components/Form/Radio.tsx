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
      {props.values.map(opt => <StyledRadioItem key={`${props.name}-${opt.value}`}>
        <StyledRadio
          name={props.name}
          id={`${props.name}-${opt.value}`}
          value={opt.value}
          onChange={e => props.onChange(e.target.value)}
          checked={props.value === opt.value}
          defaultChecked={opt.checked} />
        <StyledRadioLabel
          htmlFor={`${props.name}-${opt.value}`}
          hasError={props.hasError}>{opt.text}</StyledRadioLabel>
      </StyledRadioItem>)}
    </>
  )
}

const StyledRadioItem = styled.div`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
`

const StyledRadio = styled.input.attrs({ type: 'radio' })`
  display: none;
`

const StyledRadioLabel = styled.label<{ hasError?: boolean }>`
  display: block;

  padding: 10px;
  padding-left: 44px;
  border: 2px solid var(--outline-color);
  border-radius: 5px;

  cursor: pointer;
  transition: background-color 0.1s linear,
              border 0.1s linear,
              opacity 0.1s linear;

  position: relative;

  ${props => props.hasError && {
    border: '2px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}

  &::before {
    position: absolute;
    content: '';
    top: calc(50% - 10px);
    left: 10px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid var(--outline-color);
  }

  &::after {
    position: absolute;
    content: '';
    top: calc(50% - 4px);
    left: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--text-foreground-color);
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
`

export default FormRadio
