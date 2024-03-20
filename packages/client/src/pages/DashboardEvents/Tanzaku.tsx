import styled from 'styled-components'
import type { SockbaseApplicationDocument, SockbaseEventSpace } from 'sockbase'

interface Props {
  app: SockbaseApplicationDocument
  unionCircle: SockbaseApplicationDocument | null
  space: SockbaseEventSpace | null
  circleCutData: string | null
}
const Tanzaku: React.FC<Props> = (props) => {
  return (
    <Container>
      <MetaArea>
        <SpaceMeta>
          <AdultIndicator active={!!props.app.circle.hasAdult}>{props.app.circle.hasAdult && '成'}</AdultIndicator>
          <DualSpaceIndicator active={!!props.space?.isDualSpace}>{props.space?.isDualSpace && '２'}</DualSpaceIndicator>
          <SpaceAssignName></SpaceAssignName>
        </SpaceMeta>
        <UnionCircleMeta>
          <UnionCircleIndicator active={!!props.app.unionCircleId}>{props.app.unionCircleId && '合'}</UnionCircleIndicator>
          <UnionCircleName>{props.unionCircle?.circle.name}</UnionCircleName>
        </UnionCircleMeta>
        <PetitMeta>
          <PetitIndicator active={!!props.app.petitCode}>{props.app.petitCode && 'プ'}</PetitIndicator>
          <PetitCode>{props.app.petitCode}</PetitCode>
        </PetitMeta>
        <CircleCutMeta>
          {props.circleCutData && <CircleCut src={props.circleCutData}/>}
        </CircleCutMeta>
        <Remarks>
          <Header>通信欄</Header>
          {props.app.remarks}
        </Remarks>
      </MetaArea>
      <CircleArea>
        <AppId>
          <Header>申込みID</Header>
          {props.app.hashId}
        </AppId>
        <CircleMeta>
          <CircleName>
            <ruby>
              {props.app.circle.name}
              <rt>{props.app.circle.yomi}</rt>
            </ruby>
          </CircleName>
          <PenName>
            <ruby>
              {props.app.circle.penName}
              <rt>{props.app.circle.penNameYomi}</rt>
            </ruby>
          </PenName>
        </CircleMeta>
        <Overview>
          <Header>頒布物概要</Header>
          {props.app.overview.description}
        </Overview>
        <TotalAmount>
          <Header>総搬入量</Header>
          {props.app.overview.totalAmount}
        </TotalAmount>
      </CircleArea>
      {props.app.circle.hasAdult && <AdultBar />}
    </Container>
  )
}

export default Tanzaku

const Container = styled.div`
  border: 1px solid #000000;
  height: calc(210mm / 3 - 7mm);
  font-size: 3mm;

  display: grid;
  grid-template-columns: 40% 60%;

  break-inside: avoid;
  overflow: hidden;
  line-height: 1em;

  position: relative;
`
const Header = styled.div`
  display: inline-block;
  background-color: #000000;
  color: #ffffff;
`
const AdultBar = styled.div`
  width: 20px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background-color: #00000080;
`
const MetaArea = styled.div`
  display: grid;
  grid-template-rows: auto auto auto 1fr 20%;
  overflow: hidden;
`
const SpaceMeta = styled.div`
  display: grid;
  grid-template-columns: calc(1em + 4px) calc(1em + 4px) 1fr;
  height: calc(2em + 4px);
  border-bottom: 1px dotted #000000;
`
const AdultIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const DualSpaceIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const SpaceAssignName = styled.div`
  padding: 2px;
`
const UnionCircleMeta = styled.div`
  display: grid;
  grid-template-columns: calc(1em + 4px) 1fr;
  height: calc(1em + 4px);
  border-bottom: 1px dotted #000000;
`
const UnionCircleIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const UnionCircleName = styled.div`
  padding: 2px;
`
const PetitMeta = styled.div`
  display: grid;
  grid-template-columns: calc(1em + 4px) 1fr;
  height: calc(1em + 4px);
  border-bottom: 1px dotted #000000;
`
const PetitIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const PetitCode = styled.div`
  padding: 2px;
`
const CircleCutMeta = styled.div`
  border-bottom: 1px dotted #000000;
  text-align: center;
  height: 100%;
  overflow: hidden;
`
const CircleCut = styled.img`
  width: 100%;
`
const Remarks = styled.div`
`
const CircleArea = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr 1fr;
  border-left: 1px dotted #000000;
`
const AppId = styled.div`
  border-bottom: 1px dotted #000000;
`

const CircleMeta = styled.div`
  border-bottom: 1px dotted #000000;
`
const CircleName = styled.div`
  padding: 6px;
  padding-top: 9px;
  font-size: 1.5em;
  font-weight: bold;
`
const PenName = styled.div`
  padding: 6px;
  padding-top: 9px;
  font-size: 1.5em;
  font-weight: bold;
`
const Overview = styled.div`
  border-bottom: 1px dotted #000000;
`
const TotalAmount = styled.div`
`
