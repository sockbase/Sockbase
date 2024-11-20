import { useEffect, useMemo, useState } from 'react'
import { MdPrint } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { type SockbaseApplicationLinksDocument, type SockbaseAccount, type SockbaseApplicationDocument, type SockbaseApplicationMeta, type SockbaseEventDocument } from 'sockbase'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import NoPrintArea from '../../components/Print/NoPrintArea'
import PrintOnlyArea from '../../components/Print/PrintOnlyArea'
import BlankTanzaku from '../../components/Tanzaku/BlankTanzaku'
import CircleTanzaku from '../../components/Tanzaku/CircleTanzaku'
import EventAtamagami from '../../components/Tanzaku/EventAtamagami'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useUserData from '../../hooks/useUserData'
import PrintLayout from '../../layouts/PrintLayout/PrintLayout'

const EventPrintTanzakuPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getLinksByApplicationIdAsync,
    getCircleCutURLByHashIdNullableAsync
  } = useApplication()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [appLinks, setAppLinks] = useState<Record<string, SockbaseApplicationLinksDocument>>()
  const [users, setUsers] = useState<Record<string, SockbaseAccount>>()
  const [circleCutURLs, setCircleCutURLs] = useState<Record<string, string | null>>()

  const [blankTanzakuCount, setBlankTanzakuCount] = useState('0')

  const now = useMemo(() => new Date(), [])

  const confirmedApps = useMemo(() => {
    return apps?.filter(app => app.meta.applicationStatus === 2)
  }, [apps])

  const confirmedAppCount = useMemo(() => confirmedApps?.length ?? 0, [confirmedApps])
  const totalSpaceCount = useMemo(() => {
    return confirmedApps?.reduce((acc, a) => {
      const space = event?.spaces.find(s => s.id === a.spaceId)
      if (!space) return acc
      return acc + (space.isDualSpace ? 2 : 1)
    }, 0) ?? 0
  }, [confirmedApps, event])
  const hasAdultAppCount = useMemo(() => {
    return confirmedApps?.filter(app => app.circle.hasAdult).length ?? 0
  }, [confirmedApps])
  const petitOnlyAppCount = useMemo(() => {
    return confirmedApps?.filter(app => app.petitCode).length ?? 0
  }, [confirmedApps])
  const unionAppCount = useMemo(() => {
    return confirmedApps?.filter(app => app.unionCircleId).length ?? 0
  }, [confirmedApps])

  useEffect(() => {
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
    getApplicationsByEventIdAsync(eventId)
      .then(async fetchedApps => {
        setApps(fetchedApps)

        const appIds = fetchedApps.map(app => app.id)
        Promise.all(appIds.map(async appId => ({
          id: appId,
          data: await getLinksByApplicationIdAsync(appId)
        })))
          .then(fetchedLinks => fetchedLinks.reduce((acc, link) => ({ ...acc, [link.id]: link.data }), {}))
          .then(setAppLinks)
          .catch(err => { throw err })

        const userIds = fetchedApps.map(app => app.userId)
        Promise.all(userIds.map(async userId => ({
          id: userId,
          data: await getUserDataByUserIdAndEventIdAsync(userId, eventId)
        })))
          .then(fetchedUsers => fetchedUsers.reduce((acc, user) => ({ ...acc, [user.id]: user.data }), {}))
          .then(setUsers)
          .catch(err => { throw err })

        const appHashIds = fetchedApps.map(app => app.hashId ?? '')
        Promise.all(appHashIds.map(async hashId => ({
          hashId,
          url: await getCircleCutURLByHashIdNullableAsync(hashId)
        })))
          .then(fetchedURLs => fetchedURLs.reduce((acc, url) => ({ ...acc, [url.hashId]: url.url }), {}))
          .then(setCircleCutURLs)
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
  }, [eventId])

  return (
    <PrintLayout title="配置短冊印刷" requireCommonRole={2}>
      <Container>
        <Breadcrumbs>
          <li><Link to="/">ホーム</Link></li>
          <li><Link to="/events">イベント一覧</Link></li>
          <li>{event?._organization.name ?? <BlinkField />}</li>
          <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
        </Breadcrumbs>

        <PageTitle
          title="配置短冊印刷"
          icon={<MdPrint />} />

        <table>
          <tbody>
            <tr>
              <th style={{ width: '30%' }}>配置対象サークル</th>
              <td>{confirmedAppCount} サークル</td>
            </tr>
            <tr>
              <th style={{ width: '30%' }}>要配置総スペース</th>
              <td>{totalSpaceCount} スペース</td>
            </tr>
            <tr>
              <th style={{ width: '30%' }}>準備会スペース</th>
              <td>{Number(blankTanzakuCount) ?? 0} スペース</td>
            </tr>
          </tbody>
        </table>

        <FormSection>
          <FormItem>
            <FormLabel>準備会スペース</FormLabel>
            <FormInput
              type="number"
              value={blankTanzakuCount}
              onChange={e => setBlankTanzakuCount(e.target.value)} />
          </FormItem>
          <FormItem>
            <FormButton onClick={window.print}>
              <IconLabel icon={<MdPrint />} label="印刷プレビューを開く" />
            </FormButton>
          </FormItem>
        </FormSection>
      </Container>

      <PrintOnlyArea>
        {event && (
          <EventAtamagami
            now={now}
            event={event}
            confirmedAppCount={confirmedAppCount}
            totalSpaceCount={totalSpaceCount}
            hasAdultAppCount={hasAdultAppCount}
            petitOnlyAppCount={petitOnlyAppCount}
            unionAppCount={unionAppCount} />
        )}
        {event && confirmedApps?.map((a, i) => {
          if (!a.hashId || !users || !appLinks) return <></>

          const appLink = appLinks?.[a.id] ?? null
          const unionApp = a.unionCircleId
            ? confirmedApps.find(app => app.hashId === a.unionCircleId)
            : null
          const circleCutURL = circleCutURLs?.[a.hashId] ?? null
          return (
            <CircleTanzaku
              key={a.id}
              now={now}
              event={event}
              app={a}
              appLink={appLink}
              unionApp={unionApp}
              circleCutURL={circleCutURL}
              userData={users[a.userId]}
              appIndex={i}
              confirmedAppCount={confirmedAppCount} />
          )
        })}
        {event && Array.from({ length: Number(blankTanzakuCount) ?? 0 }).map((_, i) => (
          <BlankTanzaku
            key={`blank-${i}`}
            now={now}
            event={event}
            blankIndex={i}
            blankTanzakuCount={Number(blankTanzakuCount) ?? 0}
          />
        ))}
      </PrintOnlyArea>
    </PrintLayout>
  )
}

export default EventPrintTanzakuPage

const Container = styled(NoPrintArea)`
  padding: 20px;
`
