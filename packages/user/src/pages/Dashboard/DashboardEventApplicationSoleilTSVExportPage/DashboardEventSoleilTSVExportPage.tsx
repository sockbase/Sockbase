import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdDownload, MdListAlt } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/Textarea'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import type { SockbaseApplicationDocument, SockbaseApplicationHashIdDocument, SockbaseApplicationMeta, SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

const DashboardEventApplicationSoleilTSVExportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const {
    getEventByIdAsync,
    getSpacesByEventIdAsync
  } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync,
    getApplicationIdByHashedIdAsync
  } = useApplication()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [appHashes, setAppHashes] = useState<SockbaseApplicationHashIdDocument[]>()
  const [appMetas, setAppMetas] = useState<Record<string, SockbaseApplicationMeta>>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()

  const soleilTSV = useMemo(() => {
    if (!eventId || !apps || !appMetas || !spaces || !appHashes) return

    const filteredApps = Object.values(apps)
      .filter(a => {
        const meta = appMetas[a.id]
        return meta.applicationStatus === 2
      })

    const tsv = spaces.map((s, i) => {
      const appHashBySpace = appHashes.find(i => i.spaceId === s.id)
      const app = filteredApps.find(a => a.id === appHashBySpace?.applicationId)

      return `${eventId}-${(i + 1).toString().padStart(4, '0')}\t${s.spaceName}\t${app?.circle.name ?? ''}`
    })

    return tsv.join('\n')
  }, [eventId, apps, appMetas, spaces, appHashes])

  const downloadTSV = useCallback(() => {
    if (!soleilTSV) return
    const data = new Blob([soleilTSV], { type: 'text/tsv' })
    const objectURL = URL.createObjectURL(data)
    const downloadLink = document.createElement('a')
    document.body.appendChild(downloadLink)
    downloadLink.href = objectURL
    downloadLink.setAttribute('download', `soleil_${eventId}.tsv`)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }, [soleilTSV])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getSpacesByEventIdAsync(eventId)
        .then(fetchedSpaces => setSpaces(fetchedSpaces))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .catch(err => { throw err })
      setApps(fetchedApps)

      const appIds = Object.keys(fetchedApps)
      Promise.all(appIds.map(async appId => ({
        id: appId,
        data: await getApplicationMetaByIdAsync(appId)
      })))
        .then(fetchedAppMetas => {
          const mappedAppMetas = fetchedAppMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({ ...p, [c.id]: c.data }), {})
          setAppMetas(mappedAppMetas)
        })
        .catch(err => { throw err })

      const appHashIds = Object.values(fetchedApps)
        .filter(a => a.hashId)
        .map(a => a.hashId ?? '')
      Promise.all(appHashIds.map(async hashId => await getApplicationIdByHashedIdAsync(hashId)))
        .then(fetchedAppHashes => setAppHashes(fetchedAppHashes))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout title="Soleil データ出力">
      <Breadcrumbs>
        <li><Link to="/dashboard">ホーム</Link></li>
        <li>管理イベント</li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.name}
        description='Soleil データ出力'
        icon={<MdListAlt />}
        isLoading={!event} />

      <FormSection>
        <FormItem>
          <FormTextarea value={soleilTSV} />
        </FormItem>
        <FormItem inlined>
          <FormButton onClick={downloadTSV} inlined>
            <IconLabel
              icon={<MdDownload />}
              label="ダウンロード" />
          </FormButton>
        </FormItem>
      </FormSection>
    </DashboardBaseLayout>
  )
}

export default DashboardEventApplicationSoleilTSVExportPage
