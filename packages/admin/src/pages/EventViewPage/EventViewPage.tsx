import { useCallback, useEffect, useState } from 'react'
import {
  MdEditCalendar,
  MdAssignmentTurnedIn,
  MdPrint,
  MdBookOnline,
  MdCalendarViewMonth,
  MdImage,
  MdListAlt,
  MdMail,
  MdOpenInNew
} from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormCheck from '../../components/Form/FormCheck'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import envHelper from '../../helpers/envHelper'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationMeta,
  SockbaseEventDocument,
  SockbaseSpaceDocument
} from 'sockbase'

const EventViewPage: React.FC = () => {
  const { eventId } = useParams()

  const { getEventByIdAsync, getSpacesByEventIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationIdByHashIdAsync
  } = useApplication()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [userDataSet, setUserDataSet] = useState<Record<string, SockbaseAccount>>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [appHashes, setAppHashes] = useState<SockbaseApplicationHashIdDocument[]>()

  const getSpace = useCallback((appHashId: string) => {
    const app = appHashes?.find(app => app.hashId === appHashId)
    const spaceId = app?.spaceId
    return spaces?.find(space => space.id === spaceId)
  }, [spaces])

  const getSpaceType = useCallback((spaceId: string) => {
    return event?.spaces?.find(s => s.id === spaceId)
  }, [event])

  useEffect(() => {
    if (!eventId) return

    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
    getApplicationsByEventIdAsync(eventId)
      .then(setApps)
      .catch(err => { throw err })
    getSpacesByEventIdAsync(eventId)
      .then(setSpaces)
      .catch(err => { throw err })
  }, [eventId])

  useEffect(() => {
    if (!eventId || !apps) return

    const userIds = [...new Set(apps.map(app => app.userId))]
    Promise.all(userIds.map(async userId => ({
      id: userId,
      data: await getUserDataByUserIdAndEventIdAsync(userId, eventId)
    })))
      .then(userDataSet => setUserDataSet(userDataSet.reduce((p, c) => ({ ...p, [c.id]: c.data }), {})))
      .catch(err => { throw err })

    const appHashIds = apps.map(app => app.hashId ?? '')
    Promise.all(appHashIds.map(async hashId => await getApplicationIdByHashIdAsync(hashId)))
      .then(setAppHashes)
      .catch(err => { throw err })
  }, [apps])

  return (
    <DefaultLayout title={event?.name ?? 'イベント情報'} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEditCalendar />}
        title={event?.name}
        isLoading={!event} />

      <FormSection>
        <FormItem $inlined>
          <LinkButton to={`/events/${eventId}/print-tanzaku`}>
            <IconLabel icon={<MdPrint />} label='配置短冊印刷' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/manage-spaces`}>
            <IconLabel icon={<MdAssignmentTurnedIn />} label='配置管理' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/download-circlecuts`}>
            <IconLabel icon={<MdImage />} label='サークルカット一覧' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/create-passes`}>
            <IconLabel icon={<MdBookOnline />} label='サークル通行証発券' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/export-soleil`}>
            <IconLabel icon={<MdListAlt />} label='Soleil 出力' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/send-mails`}>
            <IconLabel icon={<MdMail />} label='メール送信' />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/view-meta`}>
            <IconLabel icon={<MdCalendarViewMonth />} label='メタ情報参照' />
          </LinkButton>
          <AnchorButton href={`${envHelper.userAppURL}/events/${eventId}`} target="_blank">
            <IconLabel icon={<MdOpenInNew />} label='申し込みページを開く' />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>状態</th>
            <th>配置</th>
            <th>サークル</th>
            <th>ペンネーム</th>
            <th>スペース</th>
            <th>ID</th>
            <th>責任者</th>
          </tr>
        </thead>
        <tbody>
          {!apps && (
            <tr>
              <td colSpan={9}>読込中です</td>
            </tr>
          )}
          {apps?.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
            .map((app, i) => (
              <tr key={app.id}>
                <td><FormCheck name={`select-${app.id}`} /></td>
                <td>{i + 1}</td>
                <td><ApplicationStatusLabel status={app.meta.applicationStatus} /></td>
                <td>{app.hashId ? getSpace(app.hashId)?.spaceName ?? '---' : <BlinkField />}</td>
                <td><Link to={`/circles/${app.hashId}`}>{app.circle.name}</Link></td>
                <td>{app.circle.penName}</td>
                <td>{getSpaceType(app.spaceId)?.name}</td>
                <td>{app.hashId ?? '---'}</td>
                <td>{userDataSet?.[app.userId].name ?? <BlinkField />}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default EventViewPage
