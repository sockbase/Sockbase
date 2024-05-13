import { useCallback, useEffect, useState } from 'react'
import { MdDownload, MdImage } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import FormButton from '../../components/Form/Button'
import FormCheckbox from '../../components/Form/Checkbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import type { SockbaseApplicationDocument, SockbaseEventDocument } from 'sockbase'

const DashboardEventCircleCutsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()

  const { getEventByIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getCircleCutURLByHashedIdNullableAsync
  } = useApplication()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [cutURLs, setCutURLs] = useState<Record<string, string | null>>()
  const [downloadCutHashIds, setDownloadCutHashIds] = useState<string[]>([])
  const [allSelect, setAllSelect] = useState(true)

  const setDownloadQueue = useCallback((hashId: string | null, add: boolean) => {
    if (!hashId) return

    if (add) {
      setDownloadCutHashIds(s => ([...s, hashId]))
    } else {
      const newQueue = downloadCutHashIds
        .filter(id => id !== hashId)
      setDownloadCutHashIds(newQueue)
    }
  }, [downloadCutHashIds])

  const handleDownload = useCallback(() => {
    if (!eventId || !apps || !cutURLs || downloadCutHashIds.length <= 0) return
    if (!confirm(`${downloadCutHashIds.length}件のサークルカットをダウンロードします\nよろしいですか？`)) return

    downloadCutHashIds.forEach(hashId => {
      const app = apps[hashId]
      const cutURL = cutURLs[hashId]
      if (!app || !cutURL) return

      const sanitizedCircleName = app.circle.name.replace(/\\\/:\*\?"<>\|/, '-')

      fetch(cutURL)
        .then(async res => {
          const blob = await res.blob()
          const objectURL = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          document.body.appendChild(link)
          link.href = objectURL
          link.download = `${eventId}_${hashId}_${sanitizedCircleName}.png`
          link.click()
          link.remove()
        })
        .catch(err => {
          alert('サークルカットのダウンロード中にエラーが発生しました')
          throw err
        })
    })
  }, [eventId, apps, cutURLs, downloadCutHashIds])

  useEffect(() => {
    if (!cutURLs) return

    if (allSelect) {
      const downloadableCutHashIds = Object.entries(cutURLs)
        .filter(([, v]) => v)
        .map(([k]) => k)
      setDownloadCutHashIds(downloadableCutHashIds)
    } else {
      setDownloadCutHashIds([])
    }
  }, [cutURLs, allSelect])

  const getCircleCutURL = useCallback((hashId: string | null) => {
    if (!cutURLs || !hashId) return null
    return cutURLs[hashId]
  }, [cutURLs])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .then(fetched => {
          const mappedApps = Object.entries(fetched)
            .reduce<Record<string, SockbaseApplicationDocument>>((p, [, v]) => {
            if (!v.hashId) return p
            return { ...p, [v.hashId]: v }
          }, {})
          return mappedApps
        })
        .catch(err => { throw err })
      setApps(fetchedApps)

      const hashIds = Object.keys(fetchedApps)

      Promise.all(hashIds.map(async hashId => ({
        hashId,
        data: await getCircleCutURLByHashedIdNullableAsync(hashId)
      })))
        .then((fetchedCutURLs) => {
          const mappedCutURLs = fetchedCutURLs.reduce<Record<string, string | null>>((p, c) => ({ ...p, [c.hashId]: c.data }), {})
          setCutURLs(mappedCutURLs)
        })
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout title="サークルカット一覧" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.eventName}
        icon={<MdImage />}
        description="サークルカット一覧"
        isLoading={!event}/>

      <FormSection>
        <FormItem inlined>
          <FormCheckbox
            name="all-select"
            checked={allSelect}
            onChange={checked => setAllSelect(checked)}
            label="すべて選択"
            inlined />
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}></th>
            <th>申し込みID</th>
            <th>サークル名</th>
            <th>サークルカット</th>
          </tr>
        </thead>
        <tbody>
          {apps && Object.keys(apps).length > 0 &&
            Object.values(apps).map(a => {
              const circleCutURL = a.hashId && getCircleCutURL(a.hashId)

              return <tr key={a.id}>
                <td>
                  <FormCheckbox
                    label='DL'
                    name={`cutDownload-${a.id}`}
                    checked={(a.hashId && downloadCutHashIds.includes(a.hashId)) || false}
                    onChange={checked => setDownloadQueue(a.hashId, checked)} />
                </td>
                <td>{a.hashId}</td>
                <td>{a.circle.name}</td>
                <td>{circleCutURL ? <CircleCutImage src={circleCutURL} /> : <>-</>}</td>
              </tr>
            })
          }
        </tbody>
      </table>

      <p>
        ダウンロード対象のサークルカット: {downloadCutHashIds.length}件
      </p>

      <FormSection>
        <FormItem inlined>
          <FormButton
            onClick={handleDownload}
            disabled={downloadCutHashIds.length <= 0}
            inlined>
            <IconLabel label="ダウンロード" icon={<MdDownload />} />
          </FormButton>
        </FormItem>
      </FormSection>

    </DashboardBaseLayout>
  )
}

export default DashboardEventCircleCutsPage

const CircleCutImage = styled.img`
  max-width: 100%;
  max-height: 128px;
`
