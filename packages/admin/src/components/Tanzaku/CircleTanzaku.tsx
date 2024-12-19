import { useMemo } from 'react'
import styled from 'styled-components'
import useDayjs from '../../hooks/useDayjs'
import A5Page from '../Print/A5Page'
import PrintContainer from '../Print/PrintContainer'
import PrintPlaceHolderField from '../Print/PrintPlaceHolderField'
import PrintSection from '../Print/PrintSection'
import PrintSectionTitle from '../Print/PrintSectionTitle'
import PrintTable from '../Print/PrintTable'
import TwoColumnLayout from '../Print/TwoColumnLayout'
import type {
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationOverviewDocument,
  SockbaseEventDocument
} from 'sockbase'

interface Props {
  now: Date
  event: SockbaseEventDocument
  app: SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }
  overview: SockbaseApplicationOverviewDocument | null
  appLink: SockbaseApplicationLinksDocument
  unionApp: (SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }) | null | undefined
  circleCutURL: string | null
  userData: SockbaseAccount
  appIndex: number
  confirmedAppCount: number
}
const CircleTanzaku: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const spaceType = useMemo(() => {
    return props.event.spaces.find(space => space.id === props.app.spaceId)
  }, [props.event, props.app])

  const genreType = useMemo(() => {
    return props.event.genres.find(genre => genre.id === props.app.circle.genre)
  }, [props.event, props.app])

  const age = useMemo(() => {
    const birthday = props.userData.birthday
    const eventDate = props.event.schedules.startEvent
    const ageDate = new Date(eventDate - birthday)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }, [props.event, props.userData])

  return (
    <A5Page>
      <PrintContainer>
        <Header>
          {props.event._organization.name} {props.event.name} 配置短冊
        </Header>
        <Main>
          <TwoColumnLayout>
            <>
              <PrintSection>
                <IndicatorRack>
                  <Indicator $active={props.app.circle.hasAdult}>
                    <IndicatorIcon>成人</IndicatorIcon>
                  </Indicator>
                  <Indicator $active={spaceType?.isDualSpace ?? false}>
                    <IndicatorIcon>2sp.</IndicatorIcon>
                  </Indicator>
                  <Indicator $active={!!props.app.unionCircleId}>
                    <IndicatorIcon>合体</IndicatorIcon>
                  </Indicator>
                  <Indicator $active={!!props.app.petitCode}>
                    <IndicatorIcon>ﾌﾟﾁｵﾝﾘｰ</IndicatorIcon>
                  </Indicator>
                </IndicatorRack>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>合体先</th>
                      <td>
                        {
                          props.app.unionCircleId
                            ? props.unionApp?.circle.name || '(合体先が存在しない)'
                            : '(空欄)'
                        }
                      </td>
                    </tr>
                    <tr>
                      <th>ﾌﾟﾁｵﾝﾘｰｺｰﾄﾞ</th>
                      <td>{props.app.petitCode || '(空欄)'}</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
            <>
              <PrintSection>
                <PrintTable>
                  <tbody>
                    <tr>
                      <td style={{ height: '15mm' }}>ブロック</td>
                      <td style={{ height: '15mm' }}>スペース</td>
                      <td style={{ height: '15mm' }}>a/b</td>
                    </tr>
                  </tbody>
                </PrintTable>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>申し込みID</th>
                      <td>{props.app.hashId}</td>
                    </tr>
                    <tr>
                      <th>スペース</th>
                      <td>{spaceType?.name}</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
          </TwoColumnLayout>
          <TwoColumnLayout>
            <>
              <PrintSection>
                <PrintSectionTitle>1. 基礎情報</PrintSectionTitle>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>サークル名</th>
                      <td>{props.app.circle.name}</td>
                    </tr>
                    <tr>
                      <th>よみ</th>
                      <td>{props.app.circle.yomi}</td>
                    </tr>
                    <tr>
                      <th>ペンネーム</th>
                      <td>{props.app.circle.penName}</td>
                    </tr>
                    <tr>
                      <th>よみ</th>
                      <td>{props.app.circle.penNameYomi}</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
              <PrintSection>
                <PrintSectionTitle>2. カタログ掲載情報</PrintSectionTitle>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>X (Twitter)</th>
                      <td>{props.appLink.twitterScreenName || '(空欄)'}</td>
                    </tr>
                    <tr>
                      <th>pixiv</th>
                      <td>{props.appLink.pixivUserId || '(空欄)'}</td>
                    </tr>
                    <tr>
                      <th>Web</th>
                      <td>{props.appLink.websiteURL || '(空欄)'}</td>
                    </tr>
                    <tr>
                      <th>お品書き</th>
                      <td>{props.appLink.menuURL || '(空欄)'}</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
            <>
              <PrintSection>
                <PrintSectionTitle>3. 頒布物情報</PrintSectionTitle>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>成人向け作品</th>
                      <td>{props.app.circle.hasAdult ? '有り' : '無し'}</td>
                    </tr>
                    <tr>
                      <th>ジャンル</th>
                      <td>{genreType?.name}</td>
                    </tr>
                    <tr>
                      <th>頒布物概要</th>
                      <td>
                        <HeightLimit>
                          {props.overview?.description ?? props.app.overview.description}
                        </HeightLimit>
                      </td>
                    </tr>
                    <tr>
                      <th>総搬入量</th>
                      <td>
                        <HeightLimit>
                          {props.overview?.totalAmount ?? props.app.overview.totalAmount}
                        </HeightLimit>
                      </td>
                    </tr>
                    <tr>
                      <th>ｻｰｸﾙｶｯﾄ</th>
                      <td style={{ fontSize: '0' }}>
                        <CircleCutArea>
                          {
                            props.circleCutURL
                              ? <CircleCut src={props.circleCutURL} />
                              : '(未提出)'
                          }
                        </CircleCutArea>
                      </td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
            <>
              <PrintSection>
                <PrintSectionTitle>4. 配置考慮情報</PrintSectionTitle>
                <PrintTable>
                  <tbody>
                    <tr>
                      <th>性別</th>
                      <td>
                        {
                          !props.userData.gender
                            ? '(空欄)'
                            : props.userData.gender === 1
                              ? '男性'
                              : '女性'
                        }
                      </td>
                      <th>開催時年齢</th>
                      <td>{age}歳</td>
                    </tr>
                  </tbody>
                </PrintTable>
              </PrintSection>
            </>
          </TwoColumnLayout>
          <PrintSection>
            <PrintSectionTitle>5. 通信欄</PrintSectionTitle>
            <PrintPlaceHolderField style={{ height: '28mm', overflow: 'hidden' }}>
              {props.app.remarks || '(空欄)'}
            </PrintPlaceHolderField>
          </PrintSection>
        </Main>
        <Footer>
          サークル: {props.appIndex + 1} / {props.confirmedAppCount}<br />
          {formatByDate(props.now, 'YYYY/MM/DD HH:mm:ss')}
        </Footer>
      </PrintContainer>
    </A5Page>
  )
}

export default CircleTanzaku

const Header = styled.div`
`
const Main = styled.div`
`
const IndicatorRack = styled.div`
  margin-bottom: 1mm;
  height: 15.25mm;
  display: flex;
  border: 0.25mm solid black;
`
const Indicator = styled.div<{ $active: boolean }>`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px dotted black;
  &:last-child {
    border-right: none;
  }
  color: #c0c0c0;

  ${({ $active }) => $active && `
    background-color: black;
    color: white;
    font-weight: bold;
  `}
`
const IndicatorIcon = styled.div`
  font-size: 10pt;
`
const CircleCutArea = styled.div`
  height: 40mm;
  text-align: center;
`
const CircleCut = styled.img`
  max-width: 100%;
  max-height: 100%;
`
const Footer = styled.div`
  text-align: right;
`
const HeightLimit = styled.div`
  height: 20mm;
  overflow: hidden;
`
