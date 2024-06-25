import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SortButton from '../../components/Parts/SortButton'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import type {
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationMeta,
  SockbaseEvent,
  SockbaseSpaceDocument
} from 'sockbase'

interface Props {
  event: SockbaseEvent | undefined
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta> | undefined
  appHashs: SockbaseApplicationHashIdDocument[] | undefined
  spaces: SockbaseSpaceDocument[] | undefined
  userDatas: Record<string, SockbaseAccount> | undefined
}
const EventCircleApplications: React.FC<Props> = (props) => {
  const [activeSortSpace, setActiveSortSpace] = useState(false)

  const circleCount = useMemo(() => {
    if (!props.metas) return
    const appCount = Object.keys(props.apps)
      .filter(i => props.metas?.[i].applicationStatus !== 1)
      .length
    return appCount
  }, [props.apps, props.metas])

  const sortedApps = useMemo(() => {
    const apps = Object.entries(props.apps)
      .filter(([_, app]) => !!app.hashId)
      .sort(([_a, a], [_b, b]) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))

    if (!activeSortSpace || !props.spaces || !props.appHashs) {
      return apps
    }

    return apps.sort(([aAppId, _a], [bAppId, _b]): number => {
      const aAppHash = props.appHashs?.filter(app => app.applicationId === aAppId)[0]
      const bAppHash = props.appHashs?.filter(app => app.applicationId === bAppId)[0]
      if (!aAppHash || !bAppHash || !aAppHash.spaceId || !bAppHash.spaceId) return 0

      const aSpace = props.spaces?.filter(s => s.id === aAppHash.spaceId)[0]
      const bSpace = props.spaces?.filter(s => s.id === bAppHash.spaceId)[0]
      const aOrder = aSpace ? aSpace.spaceGroupOrder * 100 + aSpace.spaceOrder : Number.MAX_SAFE_INTEGER
      const bOrder = bSpace ? bSpace.spaceGroupOrder * 100 + bSpace.spaceOrder : Number.MAX_SAFE_INTEGER

      return aOrder - bOrder
    })
  }, [props.appHashs, props.spaces, activeSortSpace])

  const getSpace = useCallback((spaceId: string) => {
    if (!props.event) return null
    return props.event.spaces.filter(s => s.id === spaceId)[0]
  }, [props.event])

  const getAssignedSpace = useCallback((appHashId: string) => {
    if (!props.appHashs || !props.spaces) return null

    const appHashs = props.appHashs.filter(h => h.hashId === appHashId)
    if (appHashs.length !== 1) return null

    const appHash = appHashs[0]
    if (!appHash.spaceId) return null

    const spaces = props.spaces.filter(s => s.id === appHash.spaceId)
    if (spaces.length !== 1) return null

    return spaces[0]
  }, [props.appHashs, props.spaces])

  return (
    <>
      <p>
        総申込みサークル数 (キャンセル除く): {circleCount ?? '-'} 件
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ステータス</th>
            <th>申し込み ID</th>
            <th><SortButton active={activeSortSpace} onClick={() => setActiveSortSpace(s => !s)}>配置</SortButton></th>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>申し込みスペース</th>
            <th>申込者名</th>
          </tr>
        </thead>
        <tbody>
          {sortedApps.map(([appId, app], i) => {
            if (!app.hashId) return <></>
            const applicationStatus = props.metas?.[appId].applicationStatus
            return <tr key={app.hashId}>
              <td>{i + 1}</td>
              <td>{(applicationStatus !== undefined && <ApplicationStatusLabel status={applicationStatus} />) || '-'}</td>
              <td>{app.hashId}</td>
              <td>{getAssignedSpace(app.hashId)?.spaceName ?? '-'}</td>
              <th><Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link></th>
              <td>{app.circle.penName}</td>
              <td>{getSpace(app.spaceId)?.name ?? '-'}</td>
              <td>{props.userDatas?.[app.userId].name ?? '-'}</td>
            </tr>
          })}
        </tbody>
      </table>
    </>
  )
}

export default EventCircleApplications
