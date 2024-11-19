import { useCallback, useEffect, useState } from 'react'
import { MdAddLink, MdArrowDownward, MdArrowUpward, MdDelete, MdSave } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseDocLink, SockbaseDocLinkDocument, SockbaseEventDocument } from 'sockbase'

const EventEditLinkPage: React.FC = () => {
  const { eventId } = useParams()
  const {
    getEventByIdAsync,
    getDocLinksByEventIdAsync,
    addDocLinkAsync,
    updateDocLinkAsync,
    deleteDocLinkAsync
  } = useEvent()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [docLinks, setDocLinks] = useState<SockbaseDocLinkDocument[]>()

  const [editableDocLink, setEditableDocLink] = useState({
    name: '',
    url: '',
    order: '0'
  })

  const handleAddDocLink = useCallback(() => {
    if (!eventId) return
    if (!confirm('リンクを追加します\nよろしいですか？')) return
    const docLink: SockbaseDocLink = {
      ...editableDocLink,
      order: parseInt(editableDocLink.order),
      eventId
    }
    addDocLinkAsync(docLink)
      .then(id => {
        setDocLinks(s => s && ([...s, {
          ...docLink,
          id
        }]))
      })
      .catch(err => { throw err })
  }, [eventId, editableDocLink])

  const handleSwapLink = useCallback((id: string, isUp: boolean) => {
    if (!docLinks) return

    const index = docLinks.findIndex(docLink => docLink.id === id)
    if (index === -1) return

    const targetIndex = isUp ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= docLinks.length) return

    const targetDocLink = docLinks[targetIndex]
    const docLink = docLinks[index]
    const newDocLinks = [...docLinks]
    newDocLinks[index] = {
      ...targetDocLink,
      order: docLink.order
    }
    newDocLinks[targetIndex] = {
      ...docLink,
      order: targetDocLink.order
    }
    setDocLinks(newDocLinks)
  }, [docLinks])

  const handleUpdateDocLink = useCallback(() => {
    if (!docLinks) return
    const sortedDocLinks = docLinks.map((docLink, index) => ({ ...docLink, order: index + 1 }))
    Promise.all(sortedDocLinks.map(updateDocLinkAsync))
      .then(() => alert('リンク情報を更新しました'))
      .catch(err => { throw err })
  }, [docLinks])

  const handleDeleteDocLink = useCallback((id: string) => {
    if (!eventId) return
    if (!confirm('リンクを削除します\nよろしいですか？')) return
    deleteDocLinkAsync(eventId, id)
      .then(() => {
        setDocLinks(s => s?.filter(docLink => docLink.id !== id))
      })
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
    getDocLinksByEventIdAsync(eventId)
      .then(setDocLinks)
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DefaultLayout title="資料リンク編集">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdAddLink />}
        title="資料リンク編集" />

      <TwoColumnLayout>
        <>
          <h2>現在登録されているリンク</h2>
          <table>
            <thead>
              <tr>
                <th>タイトル</th>
                <th>URL</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {docLinks === undefined && (
                <tr>
                  <td colSpan={3}>読み込み中...</td>
                </tr>
              )}
              {docLinks?.length === 0 && (
                <tr>
                  <td colSpan={3}>リンクが登録されていません</td>
                </tr>
              )}
              {docLinks?.sort((a, b) => a.order - b.order)
                .map(docLink => (
                  <tr key={docLink.id}>
                    <td>{docLink.name}</td>
                    <td><a href={docLink.url} target="_blank" rel="noreferrer">{docLink.url}</a></td>
                    <td>
                      <FormItem $inlined>
                        <FormButton onClick={() => handleSwapLink(docLink.id, true)}>
                          <IconLabel icon={<MdArrowUpward />} isOnlyIcon />
                        </FormButton>
                        <FormButton onClick={() => handleSwapLink(docLink.id, false)}>
                          <IconLabel icon={<MdArrowDownward />} isOnlyIcon />
                        </FormButton>
                        <FormButton onClick={() => handleDeleteDocLink(docLink.id)}>
                          <IconLabel icon={<MdDelete />} isOnlyIcon />
                        </FormButton>
                      </FormItem>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <FormSection>
            <FormItem>
              <FormButton onClick={handleUpdateDocLink}>
                <IconLabel icon={<MdSave />} label="リンク情報を更新" />
              </FormButton>
            </FormItem>
          </FormSection>
        </>
        <>
          <h2>リンク登録</h2>
          <FormSection>
            <FormItem>
              <FormLabel>リンク名</FormLabel>
              <FormInput
                value={editableDocLink.name}
                onChange={e => setEditableDocLink(s => ({ ...s, name: e.target.value }))}/>
            </FormItem>
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormInput
                value={editableDocLink.url}
                onChange={e => setEditableDocLink(s => ({ ...s, url: e.target.value }))}/>
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormButton onClick={handleAddDocLink}>
                <IconLabel icon={<MdAddLink />} label="リンクを追加" />
              </FormButton>
            </FormItem>
          </FormSection>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default EventEditLinkPage
