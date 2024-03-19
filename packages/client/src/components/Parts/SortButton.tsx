import React from 'react'
import { MdSort } from 'react-icons/md'
import styled from 'styled-components'

interface Props {
  active: boolean
  children: string
  onClick: () => void
}
const SortButton: React.FC<Props> = (props) => {
  return (
    <Text active={props.active} onClick={props.onClick}>
      {props.children} <MdSort />
    </Text>
  )
}

const Text = styled.span<{ active: boolean }>`
  border-bottom: 2px dotted ${props => props.active
    ? 'var(--primary-brand-color);'
    : 'var(--text-color);'};
  cursor: pointer;
  ${props => props.active
    ? 'color: var(--primary-brand-color);'
    : 'color: var(--text-color);'}
`

export default SortButton
