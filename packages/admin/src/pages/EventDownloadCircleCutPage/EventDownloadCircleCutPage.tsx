import { useCallback, useEffect, useState } from 'react'
import { MdDownload, MdImage } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import FormButton from '../../components/Form/FormButton'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseApplicationDocument, SockbaseEventDocument } from 'sockbase'

const EventDownloadCircleCutPage: React.FC = () => {
  const { eventId } = useParams()

  const { getEventByIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getCircleCutURLByHashIdNullableAsync
  } = useApplication()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()
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
    if (!confirm(`${downloadCutHashIds.length} 件のサークルカットをダウンロードします\nよろしいですか？`)) return

    const downloadTasks = downloadCutHashIds
      .map(hashId => {
        const app = apps.find(a => a.hashId === hashId)
        const cutURL = cutURLs[hashId]
        if (!app || !cutURL) return null

        const sanitizedCircleName = app.circle.name.replace(/\\\/:\*\?"<>\|/, '-')
        return {
          hashId,
          url: cutURL,
          name: sanitizedCircleName
        }
      })
      .filter(queue => queue)

    let i = 0
    let isBusy = false

    const clearToken = setInterval(() => {
      if (isBusy) return

      const task = downloadTasks[i]
      if (!task) {
        clearInterval(clearToken)
        return
      }

      isBusy = true

      fetch(task.url)
        .then(async res => {
          const blob = await res.blob()
          const objectURL = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          document.body.appendChild(link)
          link.href = objectURL
          link.download = `${eventId}_${task.hashId}_${task.name}.png`
          link.click()
          link.remove()
          isBusy = false
          i++
        })
        .catch(err => {
          clearInterval(clearToken)
          alert('サークルカットのダウンロード中にエラーが発生しました')
          throw err
        })
    }, 250)
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
        .catch(err => { throw err })

      setApps(fetchedApps)

      const hashIds = fetchedApps
        .filter(a => a.hashId)
        .map(a => a.hashId ?? '')
      Promise.all(hashIds.map(async hashId => ({
        hashId,
        data: await getCircleCutURLByHashIdNullableAsync(hashId)
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
    <DefaultLayout title="サークルカットダウンロード">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="サークルカットダウンロード"
        icon={<MdImage />} />

      <FormSection>
        <FormItem>
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
            <th>申し込み ID</th>
            <th>サークル名</th>
            <th>サークルカット</th>
          </tr>
        </thead>
        <tbody>
          {apps && apps.length > 0 &&
            apps.map(a => {
              const circleCutURL = a.hashId && getCircleCutURL(a.hashId)

              return <tr key={a.id}>
                <td>
                  <FormCheckbox
                    label='DL'
                    name={`cutDownload-${a.id}`}
                    checked={(a.hashId && downloadCutHashIds.includes(a.hashId)) || false}
                    onChange={checked => setDownloadQueue(a.hashId, checked)}
                    disabled={!circleCutURL} />
                </td>
                <td>{a.hashId}</td>
                <td>{a.circle.name}</td>
                <td>
                  {circleCutURL
                    ? <a href={circleCutURL} target="_blank" rel="noreferrer">
                      <CircleCutImage src={circleCutURL} />
                    </a>
                    : <>-</>}
                </td>
              </tr>
            })
          }
        </tbody>
      </table>

      <p>
        ダウンロード対象のサークルカット: {downloadCutHashIds.length} 件
      </p>

      <FormSection>
        <FormItem>
          <FormButton
            onClick={handleDownload}
            disabled={downloadCutHashIds.length <= 0}>
            <IconLabel label="ダウンロード" icon={<MdDownload />} />
          </FormButton>
        </FormItem>
      </FormSection>
    </DefaultLayout>
  )
}

export default EventDownloadCircleCutPage

const CircleCutImage = styled.img`
  max-width: 100%;
  max-height: 128px;
`
