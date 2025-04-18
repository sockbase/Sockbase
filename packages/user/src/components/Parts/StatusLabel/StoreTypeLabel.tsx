import styled from 'styled-components'
import { type SockbaseStoreType } from 'sockbase'
import BlinkField from '../BlinkField'

interface Props {
  type: SockbaseStoreType | undefined
}
const StoreTypeLabel: React.FC<Props> = props => {
  return (
    <Container bgColor={props.type?.color || 'var(--pending-color)'}>
      {props.type?.name ?? <BlinkField />}
    </Container>
  )
}

export default StoreTypeLabel

const Container = styled.label<{ bgColor: string }>`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;

  color: var(--white-color);
  background-color: ${props => props.bgColor};
`
