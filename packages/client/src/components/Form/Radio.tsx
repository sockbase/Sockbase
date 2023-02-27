import styled from 'styled-components'

interface Props {
  key: string
  values: Array<{
    value: string
    text: string
    checked?: boolean
  }>
}
const FormRadio: React.FC<Props> = (props) => {
  return (
    <>
      {props.values.map(i => <>
        <StyledRadio name={props.key} id={`${props.key}-${i.value}`} value={i.value} checked={i.checked} />
        <StyledRadioLabel htmlFor={`${props.key}-${i.value}`}>{i.text}</StyledRadioLabel>
      </>)}
    </>
  )
}

const StyledRadio = styled.input.attrs({ type: 'radio' })`
  display: none;
`

const StyledRadioLabel = styled.label`
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
    border-radius: 50%;
    border: 3px solid #808080;
  }
  &::after {
    position: absolute;
    content: '';
    top: calc(50% - 4px);
    left: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ffffff;
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

export default FormRadio
