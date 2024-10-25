import { useEffect, useState } from 'react'
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
  SockbaseApplicationMeta,
  SockbaseEventDocument
} from 'sockbase'

const EventViewPage: React.FC = () => {
  const { eventId } = useParams()

  const { getEventByIdAsync } = useEvent()
  const { getApplicationsByEventIdAsync } = useApplication()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [userDataSet, setUserDataSet] = useState<Record<string, SockbaseAccount>>()

  useEffect(() => {
    if (!eventId) return

    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })

    getApplicationsByEventIdAsync(eventId)
      .then(setApps)
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
  }, [apps])

  return (
    <DefaultLayout title={event?.name ?? 'イベント情報'} requireSystemRole={2}>
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
          <LinkButton to="/">
            <IconLabel icon={<MdPrint />} label='配置短冊印刷' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdAssignmentTurnedIn />} label='配置管理' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdImage />} label='サークルカット一覧' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdBookOnline />} label='サークル通行証発券' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdListAlt />} label='Soleil' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdMail />} label='メール送信' />
          </LinkButton>
          <LinkButton to="/">
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
            <th>#</th>
            <th>状態</th>
            <th>ID</th>
            <th>配置</th>
            <th>サークル</th>
            <th>ペンネーム</th>
            <th>スペース</th>
            <th>責任者</th>
          </tr>
        </thead>
        <tbody>
          {!apps && (
            <tr>
              <td colSpan={8}>読込中です</td>
            </tr>
          )}
          {apps?.map((app, i) => (
            <tr key={app.id}>
              <td>{i + 1}</td>
              <td><ApplicationStatusLabel status={app.meta.applicationStatus} /></td>
              <td>{app.hashId ?? '- ! -'}</td>
              <td>- TBD -</td>
              <td><Link to={`/circles/${app.hashId}`}>{app.circle.name}</Link></td>
              <td>{app.circle.penName}</td>
              <td>{app.spaceId}</td>
              <td>{userDataSet?.[app.userId].name ?? <BlinkField />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default EventViewPage
