import { useEffect, useState } from 'react'
import { MdEdit, MdOpenInNew } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import AnchorButton from '../../../components/Parts/AnchorButton'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import type {
  SockbaseEventDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationDocument,
  SockbaseDocLinkDocument
} from 'sockbase'

const DashboardCircleViewLinksPage: React.FC = () => {
  const { hashId } = useParams()
  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync
  } = useApplication()
  const {
    getEventByIdAsync,
    getDocLinksByEventIdAsync
  } = useEvent()

  const [appHash, setAppHash] = useState<SockbaseApplicationHashIdDocument>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [docLinks, setDocLinks] = useState<SockbaseDocLinkDocument[]>()

  useEffect(() => {
    if (!hashId) return
    getApplicationIdByHashIdAsync(hashId)
      .then(setAppHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!appHash) return
    getApplicationByIdAsync(appHash.applicationId)
      .then(setApp)
      .catch(err => { throw err })
    getEventByIdAsync(appHash.eventId)
      .then(setEvent)
      .catch(err => { throw err })
    getDocLinksByEventIdAsync(appHash.eventId)
      .then(setDocLinks)
      .catch(err => { throw err })
  }, [appHash])

  return (
    <DashboardBaseLayout title="資料リンク確認">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
        <li>{event ? event.name : <BlinkField />}</li>
        <li>{app ? <Link to={`/dashboard/applications/${hashId}`}>{app.circle.name}</Link> : <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEdit />}
        title={app?.circle.name}
        description="資料リンクを確認します"
        isLoading={!app} />

      <table>
        <thead>
          <tr>
            <th style={{ width: '75%' }}>タイトル</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {docLinks === undefined && (
            <tr>
              <td colSpan={2}>読み込み中…</td>
            </tr>
          )}
          {docLinks?.length === 0 && (
            <tr>
              <td colSpan={2}>リンクがありません</td>
            </tr>
          )}
          {docLinks?.sort((a, b) => a.order - b.order)
            .map(docLink => (
              <tr key={docLink.id}>
                <td>{docLink.name}</td>
                <td>
                  <AnchorButton
                    href={docLink.url}
                    $isSlim={true}
                    target="_blank"
                    rel="noopener noreferrer">
                    <IconLabel icon={<MdOpenInNew />} label="開く" />
                  </AnchorButton>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </DashboardBaseLayout>
  )
}

export default DashboardCircleViewLinksPage
