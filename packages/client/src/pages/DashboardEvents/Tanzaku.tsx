import styled from 'styled-components'
import type { SockbaseApplicationDocument, SockbaseEventSpace } from 'sockbase'

interface Props {
  app: SockbaseApplicationDocument
  space: SockbaseEventSpace | null
  circleCutData: string | null
}
const Tanzaku: React.FC<Props> = (props) => {
  return (
    <Container>
      <AssignMeta>
        {props.space?.name} / {props.app.circle.hasAdult ? '成' : 'ー'}
      </AssignMeta>
      <SpaceArea />
      <CircleCutArea>
        {props.circleCutData && <CircleCut src={props.circleCutData} />}
      </CircleCutArea>
      <CircleMeta>
        {props.app.circle.name}
        {props.app.circle.penName}
      </CircleMeta>
      {props.app.circle.genre}
      {props.app.circle.hasAdult}
      {props.app.overview.description}
      {props.app.overview.totalAmount}
      {props.app.remarks}
    </Container>
  )
}

export default Tanzaku

const Container = styled.div`
  border: 1px dotted #000000;
  padding: 5px;
  height: 200px;
  font-size: 12px;

  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 25% 1fr;

  break-inside: avoid;
`
const AssignMeta = styled.div`
  grid-column: 2 / 3;
  grid-row: 1;
`
const SpaceArea = styled.div`
  height: 32px;
  border: 1px solid #ffffff;
`
const CircleCutArea = styled.div`
  grid-column: 1;
  grid-row: 1 / 3;
`
const CircleCut = styled.img`
  width: 100%;
`
const CircleMeta = styled.div`
  grid-column: 2 / 3;
  grid-row: 2;
`
