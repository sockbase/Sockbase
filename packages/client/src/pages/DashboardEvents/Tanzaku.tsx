import { useMemo } from 'react'
import styled from 'styled-components'
import ReactQRCode from 'react-qr-code'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEventDocument, SockbaseEventGenre, SockbaseEventSpace } from 'sockbase'

interface Props {
  isDummy: boolean
  dummyNumber?: number
  app?: SockbaseApplicationDocument
  event: SockbaseEventDocument
  userData?: SockbaseAccount
  unionCircle?: SockbaseApplicationDocument | null
  circleCutData?: string | null
}
const Tanzaku: React.FC<Props> = (props) => {
  const eventAge = useMemo(() => {
    const span = props.event.schedules.startEvent - (props.userData?.birthday ?? 0)
    return Math.floor(span / (365 * 24 * 60 * 60 * 1000))
  }, [props.event, props.userData])

  const space = useMemo((): SockbaseEventSpace | null => {
    return props.event.spaces.filter(s => s.id === props.app?.spaceId)[0]
  }, [props.event, props.app])

  const genre = useMemo((): SockbaseEventGenre | null => {
    return props.event.genres.filter(g => g.id === props.app?.circle.genre)[0]
  }, [props.event, props.app])

  return (
    <Container>
      <MetaArea>
        <AssignMetaArea>
          <SpaceMeta>
            <AdultIndicator active={!!props.app?.circle.hasAdult}>{props.app?.circle.hasAdult && '成'}</AdultIndicator>
            <DualSpaceIndicator active={!!space?.isDualSpace}>{space?.isDualSpace && '２'}</DualSpaceIndicator>
            <SpaceAssignName></SpaceAssignName>
          </SpaceMeta>
          <UnionCircleMeta>
            <UnionCircleIndicator active={!!props.app?.unionCircleId}>{props.app?.unionCircleId && '合'}</UnionCircleIndicator>
            <UnionCircleName>{props.unionCircle?.circle.name}</UnionCircleName>
          </UnionCircleMeta>
          <PetitMeta>
            <PetitIndicator active={!!props.app?.petitCode}>{props.app?.petitCode && 'プ'}</PetitIndicator>
            <PetitCode>{props.app?.petitCode}</PetitCode>
          </PetitMeta>
          <AppIdQRArea>
            {props.app && <AppIdQR value={props.app.hashId ?? ''} size={64} />}
          </AppIdQRArea>
        </AssignMetaArea>
        <CircleCutMeta>
          {props.circleCutData && <CircleCut src={props.circleCutData}/>}
        </CircleCutMeta>
        <Remarks>
          <Header>通信欄</Header>
          {props.app?.remarks}
        </Remarks>
      </MetaArea>
      <CircleArea>
        <EventName>
          <Header>イベント</Header>
          {props.event.eventName}
        </EventName>
        <AppId>
          <Header>申込みID</Header>
          {props.app?.hashId}
        </AppId>
        <CircleMeta>
          <CircleName>
            {props.app && <ruby>
              {props.app?.circle.name}
              <rt>{props.app?.circle.yomi}</rt>
            </ruby>}
            {props.isDummy && <ruby>
              準備会スペース #{props.dummyNumber}
              <rt>じゅんびかいすぺーす</rt>
            </ruby>}
          </CircleName>
          <PenName>
            <ruby>
              {props.app?.circle.penName}
              <rt>{props.app?.circle.penNameYomi}</rt>
            </ruby>
          </PenName>
        </CircleMeta>
        <Genre>
          <Header>ジャンル</Header>
          {genre?.name}
        </Genre>
        <Overview>
          <Header>頒布物概要</Header>
          {props.app?.overview.description}
        </Overview>
        <TotalAmount>
          <Header>総搬入量</Header>
          {props.app?.overview.totalAmount}
        </TotalAmount>
        <Age>
          <Header>開催時年齢</Header>
          {props.userData && eventAge}
        </Age>
        <SpecialRemarks>
          <Header>特殊処理メモ</Header>
        </SpecialRemarks>
      </CircleArea>
      {props.app?.circle.hasAdult && <AdultBar />}
      {space?.isDualSpace && <DualSpaceBar />}
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
  margin-right: 4px;
`
const AdultBar = styled.div`
  width: 15px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background-color: #00000020;
`
const DualSpaceBar = styled.div`
  width: 100%;
  height: 15px;
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #00000020;
`
const MetaArea = styled.div`
  display: grid;
  grid-template-rows: auto 50% 25%;
  overflow: hidden;
`
const AssignMetaArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 64px;
  grid-template-rows: 1fr auto auto;
  border-bottom: 1px dotted #000000;
`
const SpaceMeta = styled.div`
  grid-column: 1;
  display: grid;
  grid-template-columns: calc(1em + 4px) calc(1em + 4px) 1fr;
  /* height: calc(2em + 4px); */
  border-bottom: 1px dotted #000000;
  border-right: 1px dotted #000000;
`
const AdultIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
    font-weight: bold;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const DualSpaceIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
    font-weight: bold;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const SpaceAssignName = styled.div`
  padding: 2px;
`
const UnionCircleMeta = styled.div`
  grid-column: 1;
  display: grid;
  grid-template-columns: calc(1em + 4px) 1fr;
  height: calc(1em + 4px);
  border-bottom: 1px dotted #000000;
  border-right: 1px dotted #000000;
`
const UnionCircleIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
    font-weight: bold;
  `}
  padding: 2px;
  border-right: 1px dotted #000000;
`
const UnionCircleName = styled.div`
  padding: 2px;
`
const PetitMeta = styled.div`
  grid-column: 1;
  display: grid;
  grid-template-columns: calc(1em + 4px) 1fr;
  height: calc(1em + 4px);
  border-right: 1px dotted #000000;
`
const PetitIndicator = styled.div<{ active: boolean }>`
  ${props => props.active && `
    background-color: #000000;
    color: #ffffff;
    font-weight: bold;
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
  max-width: 100%;
  max-height: 100%;
`
const Remarks = styled.div`
`
const AppIdQRArea = styled.div`
  grid-column: 2;
  grid-row: 1 / 4;
  overflow: hidden;
`
const AppIdQR = styled(ReactQRCode)`
  max-height: 100%;
  padding: 7px;
`
const CircleArea = styled.div`
  display: grid;
  grid-template-rows: auto auto auto auto 2fr 2fr 1fr;
  grid-template-columns: 1fr 1fr auto;
  border-left: 1px dotted #000000;
`
const EventName = styled.div`
  grid-column: 1 / 4;
  border-bottom: 1px dotted #000000;
`
const AppId = styled.div`
  grid-column: 1 / 4;
  border-bottom: 1px dotted #000000;
`
const CircleMeta = styled.div`
  grid-column: 1 / 4;
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
  font-size: 1.25em;
  font-weight: bold;
`
const Genre = styled.div`
  grid-column: 1 / 4;
  border-bottom: 1px dotted #000000;
  overflow: hidden;
`
const Overview = styled.div`
  grid-column: 1 / 4;
  border-bottom: 1px dotted #000000;
  overflow: hidden;
`
const TotalAmount = styled.div`
  grid-column: 1 / 4;
  border-bottom: 1px dotted #000000;
  overflow: hidden;
`
const Age = styled.div`
  grid-column: 1;
  border-right: 1px dotted #000000;
`
const SpecialRemarks = styled.div`
  grid-column: 2;
`
