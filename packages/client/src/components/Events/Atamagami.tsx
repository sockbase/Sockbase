import styled from 'styled-components'
import type { SockbaseEventDocument } from 'sockbase'

interface Props {
  event: SockbaseEventDocument
  circleCount: number
  spaceCount: number
  adultCount: number
  unionCircleCount: number
  petitCount: number
}
const Atamagami: React.FC<Props> = (props) => {
  return (
    <Container>
      <EventMeta>
        <OrganizationName>
          {props.event._organization.name}
        </OrganizationName>
        <EventName>
          {props.event.eventName}
        </EventName>
        <CircleCount>
          <Header>申込確定サークル</Header>
          {props.circleCount}サークル
        </CircleCount>
        <SpaceCount>
          <Header>要配置総スペース</Header>
          {props.spaceCount}スペース
        </SpaceCount>
        <AdultCount>
          <Header>成人向けサークル</Header>
          {props.adultCount}サークル
        </AdultCount>
        <UnionCircleCount>
          <Header>合体申込サークル</Header>
          {props.unionCircleCount}サークル
        </UnionCircleCount>
        <PetitCount>
          <Header>プチオンリー申込</Header>
          {props.petitCount}サークル
        </PetitCount>
        <Header>備考</Header>
      </EventMeta>
      <AssignMeta>
        <Header>特殊対応履歴</Header>
      </AssignMeta>
    </Container>
  )
}

export default Atamagami

const Container = styled.div`
  border: 1px solid #000000;
  height: calc(210mm / 3 - 7mm);
  font-size: 3mm;

  display: grid;
  grid-template-columns: 1fr 1fr;
`
const Header = styled.div`
  display: inline-block;
  background-color: #000000;
  color: #ffffff;
  margin-right: 4px;
`
const EventMeta = styled.div`
  border-right: 1px dotted #000000;
`
const OrganizationName = styled.div`
  border-bottom: 1px dotted #000000;
`
const EventName = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  border-bottom: 1px dotted #000000;
`
const CircleCount = styled.div`
  border-bottom: 1px dotted #000000;
`
const SpaceCount = styled.div`
  border-bottom: 1px dotted #000000;
`
const AdultCount = styled.div`
  border-bottom: 1px dotted #000000;
`
const UnionCircleCount = styled.div`
  border-bottom: 1px dotted #000000;
`
const PetitCount = styled.div`
  border-bottom: 1px dotted #000000;
`
const AssignMeta = styled.div`
  /* grid-template-rows:  */
`
