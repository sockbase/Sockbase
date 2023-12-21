import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  type SockbaseEventSpace,
  type SockbaseApplicationDocument,
  type SockbaseEvent,
  type SockbaseEventGenre,
  type SockbaseApplicationHashIdDocument,
  type SockbaseSpaceDocument
} from 'sockbase'
import { MdEvent } from 'react-icons/md'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'
import LinkButton from '../../components/Parts/LinkButton'

const EventApplicationListPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync, getSpaceAsync } = useEvent()
  const { getApplicationsByEventIdAsync, getApplicationIdByHashedIdAsync } = useApplication()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  // const [appHashes, setAppHashes] = useState<Record<string, SockbaseApplicationHashIdDocument>>()
  const [spaces, setSpaces] = useState<Record<string, SockbaseSpaceDocument>>()

  const onInitialize = (): void => {
    const fetchEventsAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .catch(err => { throw err })
      setApps(fetchedApps)

      const hashIds = Object.values(fetchedApps)
        .filter(app => !!app.hashId)
        .map(app => app.hashId as string)
      const mappedAppHashes = await Promise.all(
        hashIds.map(async id => ({ id, data: await getApplicationIdByHashedIdAsync(id) }))
      )
        .then(fetchedAppHashes => fetchedAppHashes.reduce<Record<string, SockbaseApplicationHashIdDocument>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
        .catch(err => { throw err })
      // setAppHashes(mappedAppHashes)

      Promise.all(
        Object.values(mappedAppHashes)
          .filter(appHash => appHash.spaceId)
          .map(appHash => ({ hashId: appHash.hashId, spaceId: appHash.spaceId as string }))
          .map(async appHash => ({ hashId: appHash.hashId, data: await getSpaceAsync(appHash.spaceId) }))
      )
        .then(fetchedSpaces => {
          const mappedSpaces = fetchedSpaces.reduce<Record<string, SockbaseSpaceDocument>>((p, c) => ({ ...p, [c.hashId]: c.data }), {})
          setSpaces(mappedSpaces)
        })
        .catch(err => { throw err })
    }
    fetchEventsAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [eventId])

  const getSpace = useCallback((spaceId: string): SockbaseEventSpace | null => {
    if (!event) return null

    const space = event.spaces.filter(s => s.id === spaceId)[0]
    return space
  }, [event])

  const getGenre = useCallback((genreId: string): SockbaseEventGenre | null => {
    if (!event) return null

    const genre = event.genres.filter(g => g.id === genreId)[0]
    return genre
  }, [event])

  return (
    <MainLayout title={event?.eventName ?? '読み込み中'} subTitle="申し込み一覧" icon={<MdEvent />}>
      <table>
        <thead>
          <tr>
            <td>#</td>
            <td></td>
            <td>配置</td>
            <td>サークル名</td>
            <td>ペンネーム</td>
            <td>申し込みスペース</td>
            <td>ジャンル</td>
            <td>隣接配置希望</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {apps && Object.entries(apps).map(([id, app], i) => <tr key={id}>
            <td>{i + 1}</td>
            <td></td>
            <td>{(app.hashId && spaces?.[app.hashId]?.spaceName) ?? '-'}</td>
            <th>{app.circle.name}</th>
            <td>{app.circle.penName}</td>
            <td>{getSpace(app.spaceId)?.name}</td>
            <td>{getGenre(app.circle.genre)?.name}</td>
            <td>{app.unionCircleId ? apps[app.unionCircleId]?.circle.name : '-'}</td>
            <td><LinkButton to={`/applications/${app.hashId}`}>開く</LinkButton></td>
          </tr>)}
        </tbody>
      </table>
    </MainLayout>
  )
}

export default EventApplicationListPage
