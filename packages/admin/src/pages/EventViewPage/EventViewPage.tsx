import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MdEditCalendar,
  MdAssignmentTurnedIn,
  MdPrint,
  MdBookOnline,
  MdCalendarViewMonth,
  MdImage,
  MdListAlt,
  MdMail,
  MdOpenInNew,
  MdRefresh,
  MdAddLink
} from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import SortButton from '../../components/Parts/SortButton'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/StatusLabel/PaymentStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import envHelper from '../../helpers/envHelper'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useEvent from '../../hooks/useEvent'
import usePayment from '../../hooks/usePayment'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbasePaymentDocument,
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
  const { getPaymentByIdAsync } = usePayment()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { formatByDate } = useDayjs()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [userDataSet, setUserDataSet] = useState<Record<string, SockbaseAccount>>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [appHashes, setAppHashes] = useState<SockbaseApplicationHashIdDocument[]>()
  const [payments, setPayments] = useState<Record<string, SockbasePaymentDocument>>()

  const [isActiveSort, setIsActiveSort] = useState(false)

  const aggregatedApps = useMemo(() => {
    if (!event || !apps) return
    const confirmedCircle = apps.filter(a => a.meta.applicationStatus === 2)
    return {
      totalCircleCount: apps.filter(a => a.meta.applicationStatus !== 1).length,
      confirmedCircleCount: confirmedCircle.length,
      confirmedSpaceCount: confirmedCircle
        .reduce((p, c) => {
          const space = event.spaces.find(s => s.id === c.spaceId)
          const spaceCount = space?.isDualSpace ? 2 : 1
          return p + spaceCount
        }, 0)
    }
  }, [event, apps])

  const getSpace = useCallback((appHashId: string) => {
    const app = appHashes?.find(app => app.hashId === appHashId)
    const spaceId = app?.spaceId
    return spaces?.find(space => space.id === spaceId)
  }, [appHashes, spaces])

  const getSpaceType = useCallback((spaceId: string) => {
    return event?.spaces?.find(s => s.id === spaceId)
  }, [event])

  const handleRefresh = useCallback((eventId: string) => {
    setApps(undefined)
    setSpaces(undefined)

    getApplicationsByEventIdAsync(eventId)
      .then(setApps)
      .catch(err => { throw err })
    getSpacesByEventIdAsync(eventId)
      .then(setSpaces)
      .catch(err => { throw err })
  }, [])

  const sortedApps = useMemo(() => {
    if (!apps) return
    if (isActiveSort) {
      return apps
        .sort((a, b) => {
          const spaceA = getSpace(a.hashId ?? '')?.spaceName
          const spaceB = getSpace(b.hashId ?? '')?.spaceName
          if (!spaceA || !spaceB) return !spaceA ? 1 : -1
          return spaceA.localeCompare(spaceB, 'ja', { numeric: true })
        })
    }
    else {
      return apps.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
    }
  }, [apps, isActiveSort])

  useEffect(() => {
    if (!eventId) return

    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
    handleRefresh(eventId)
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
    Promise.all(appHashIds.map(getApplicationIdByHashIdAsync))
      .then(setAppHashes)
      .catch(err => { throw err })
  }, [apps])

  useEffect(() => {
    if (!appHashes) return
    const paymentIds = appHashes.map(h => ({ id: h.applicationId, paymentId: h.paymentId }))
    Promise.all(paymentIds.map(async p => ({
      id: p.id,
      data: await getPaymentByIdAsync(p.paymentId)
    })))
      .then(fetchedPayments => setPayments(fetchedPayments.reduce((p, c) => ({ ...p, [c.id]: c.data }), {})))
      .catch(err => { throw err })
  }, [appHashes])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title={event?.name ?? 'イベント情報'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEditCalendar />}
        isLoading={!event}
        title={event?.name} />

      <FormSection>
        <FormItem>
          <FormButton
            disabled={!eventId}
            onClick={() => eventId && handleRefresh(eventId)}>
            <IconLabel
              icon={<MdRefresh />}
              label="最新の情報に更新" />
          </FormButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem $inlined>
          <AnchorButton
            href={`/events/${eventId}/print-tanzaku`}
            target="_blank">
            <IconLabel
              icon={<MdPrint />}
              label="配置短冊印刷" />
          </AnchorButton>
          <LinkButton to={`/events/${eventId}/manage-spaces`}>
            <IconLabel
              icon={<MdAssignmentTurnedIn />}
              label="配置管理" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/download-circlecuts`}>
            <IconLabel
              icon={<MdImage />}
              label="サークルカット一覧" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/create-passes`}>
            <IconLabel
              icon={<MdBookOnline />}
              label="サークル通行証発券" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/export-soleil`}>
            <IconLabel
              icon={<MdListAlt />}
              label="Soleil 出力" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/send-mails`}>
            <IconLabel
              icon={<MdMail />}
              label="メール送信" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/edit-links`}>
            <IconLabel
              icon={<MdAddLink />}
              label="資料リンク編集" />
          </LinkButton>
          <LinkButton to={`/events/${eventId}/view-meta`}>
            <IconLabel
              icon={<MdCalendarViewMonth />}
              label="メタ情報参照" />
          </LinkButton>
          <AnchorButton
            href={`${envHelper.userAppURL}/events/${eventId}`}
            target="_blank">
            <IconLabel
              icon={<MdOpenInNew />}
              label="申し込みページを開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <h2>統計情報</h2>

      <TwoColumnLayout>
        <>
          <table>
            <tbody>
              <tr>
                <th>サークル数 (仮申し込み含む)</th>
                <td>{aggregatedApps ? `${aggregatedApps.totalCircleCount} サークル` : <BlinkField />}</td>
              </tr>
              <tr>
                <th>確定サークル数</th>
                <td>{aggregatedApps ? `${aggregatedApps.confirmedCircleCount} サークル` : <BlinkField />}</td>
              </tr>
              <tr>
                <th>スペース数</th>
                <td>{aggregatedApps ? `${aggregatedApps.confirmedSpaceCount} スペース` : <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <></>
      </TwoColumnLayout>

      <h2>申し込み一覧</h2>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>状態</th>
            <th>決済</th>
            <th>
              <SortButton
                active={isActiveSort}
                onClick={() => setIsActiveSort(s => !s)}>
                配置
              </SortButton>
            </th>
            <th>サークル</th>
            <th>ペンネーム</th>
            <th>スペース</th>
            <th>ID</th>
            <th>責任者</th>
            <th>申し込み日時</th>
          </tr>
        </thead>
        <tbody>
          {!sortedApps && (
            <tr>
              <td colSpan={9}>読み込み中…</td>
            </tr>
          )}
          {sortedApps && sortedApps.length === 0 && (
            <tr>
              <td colSpan={9}>データがありません</td>
            </tr>
          )}
          {sortedApps?.map((app, i) => (
            <tr key={app.id}>
              <td>{i + 1}</td>
              <td>
                <ApplicationStatusLabel
                  isOnlyIcon
                  status={app.meta.applicationStatus} />
              </td>
              <td>
                <PaymentStatusLabel
                  isOnlyIcon
                  isShowBrand
                  payment={payments?.[app.id]} />
              </td>
              <td>{app.hashId ? getSpace(app.hashId)?.spaceName ?? '---' : <BlinkField />}</td>
              <td>{app.circle.name}</td>
              <td>{app.circle.penName}</td>
              <td>{getSpaceType(app.spaceId)?.name}</td>
              <td><Link to={`/circles/${app.hashId}`}>{app.hashId ?? '---'}</Link></td>
              <td>{userDataSet?.[app.userId].name ?? <BlinkField />}</td>
              <td>{app ? formatByDate(app.createdAt) : <BlinkField />} </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default EventViewPage
