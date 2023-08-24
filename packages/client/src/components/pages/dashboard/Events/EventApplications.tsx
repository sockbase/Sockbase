import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseApplicationHashIdDocument, SockbaseApplicationMeta, SockbaseEvent, SockbaseSpaceDocument } from 'sockbase'
import ApplicationStatusLabel from '../../../Parts/StatusLabel/ApplicationStatusLabel'

interface Props {
  event: SockbaseEvent
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta>
  appHashs: SockbaseApplicationHashIdDocument[]
  spaces: SockbaseSpaceDocument[]
}
const EventApplications: React.FC<Props> = (props) => {
  const circleCount = useMemo(() => {
    const appCount = Object.keys(props.apps)
      .filter(i => props.metas[i].applicationStatus !== 1)
      .length
    return appCount
  }, [props.apps])

  const spaceName: (spaceId: string) => string =
    (spaceId) => props.event.spaces
      .filter(s => s.id === spaceId)[0].name

  const genreName = (genreId: string): string =>
    props.event.genres
      .filter(g => g.id === genreId)[0].name

  const circleNameByHashId = (appHashId: string): string =>
    Object.values(props.apps)
      .filter(a => a.hashId === appHashId)[0].circle.name

  const getSpace = (appHashId: string): SockbaseSpaceDocument | null => {
    const appHashs = props.appHashs.filter(h => h.hashId === appHashId)
    if (appHashs.length !== 1) return null

    const appHash = appHashs[0]
    if (!appHash.spaceId) return null

    const spaces = props.spaces.filter(s => s.id === appHash.spaceId)
    if (spaces.length !== 1) return null

    return spaces[0]
  }

  return (
    <>
      <p>
        総申込みサークル数(キャンセル除く): {circleCount}件
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th></th>
            <th>配置</th>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>申し込みスペース</th>
            <th>ジャンル</th>
            <th>隣接配置希望</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(props.apps)
              .filter(([_, app]) => !!app.hashId)
              .sort(([_a, a], [_b, b]) => (a.createdAt?.getTime() ?? 9) - (b.createdAt?.getTime() ?? 0))
              .map(([appId, app], i) => (
                app.hashId && <tr key={app.hashId}>
                  <td>{Object.entries(props.apps).length - i}</td>
                  <td><ApplicationStatusLabel status={props.metas[appId].applicationStatus} /></td>
                  <td>{getSpace(app.hashId)?.spaceName ?? '-'}</td>
                  <th><Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link></th>
                  <td>{app.circle.penName}</td>
                  <td>{spaceName(app.spaceId)}</td>
                  <td>{genreName(app.circle.genre)}</td>
                  <td>{(app.unionCircleId && circleNameByHashId(app.unionCircleId)) || '-'}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </>
  )
}

export default EventApplications
