import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdDownload, MdListAlt } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormTextarea from '../../components/Form/FormTextarea'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationMeta,
  SockbaseEventDocument,
  SockbaseSpaceDocument
} from 'sockbase'

const EventExportSoleilPage: React.FC = () => {
  const { eventId } = useParams()
  const {
    getEventByIdAsync,
    getSpacesByEventIdAsync
  } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationIdByHashIdAsync
  } = useApplication()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [appHashes, setAppHashes] = useState<SockbaseApplicationHashIdDocument[]>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()

  const soleilTSV = useMemo(() => {
    if (!eventId || !apps || !spaces || !appHashes) return

    const filteredApps = Object.values(apps)
      .filter(a => a.meta.applicationStatus === 2)

    const tsv = spaces.map((s, i) => {
      const appHashBySpace = appHashes.find(i => i.spaceId === s.id)
      const app = filteredApps.find(a => a.id === appHashBySpace?.applicationId)

      return `${eventId}-${(i + 1).toString().padStart(4, '0')}\t${s.spaceName}\t${app?.circle.name ?? ''}`
    })

    return tsv.join('\n')
  }, [eventId, apps, spaces, appHashes])

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

      const appHashIds = Object.values(fetchedApps)
        .filter(a => a.hashId)
        .map(a => a.hashId ?? '')
      Promise.all(appHashIds.map(async hashId => await getApplicationIdByHashIdAsync(hashId)))
        .then(fetchedAppHashes => setAppHashes(fetchedAppHashes))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title="Soleil 出力">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdListAlt />}
        title="Soleil 出力" />

      <FormSection>
        <FormItem>
          <FormTextarea value={soleilTSV} />
        </FormItem>
        <FormItem>
          <FormButton onClick={downloadTSV}>
            <IconLabel
              icon={<MdDownload />}
              label="ダウンロード" />
          </FormButton>
        </FormItem>
      </FormSection>
    </DefaultLayout>
  )
}

export default EventExportSoleilPage
