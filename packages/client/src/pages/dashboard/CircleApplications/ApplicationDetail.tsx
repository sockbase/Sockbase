import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbasePaymentDocument,
  type SockbaseAccount,
  type SockbaseApplicationDocument,
  type SockbaseApplicationMeta,
  type SockbaseApplicationStatus,
  type SockbaseEvent,
  type SockbaseApplicationLinksDocument
} from 'sockbase'
import sockbaseShared from 'shared'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import usePayment from '../../../hooks/usePayment'
import useUserData from '../../../hooks/useUserData'
import useRole from '../../../hooks/useRole'
import useDayjs from '../../../hooks/useDayjs'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
// import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import Alert from '../../../components/Parts/Alert'
import { MdEdit } from 'react-icons/md'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import BlinkField from '../../../components/Parts/BlinkField'
import TwoColumnsLayout from '../../../components/Layout/TwoColumns/TwoColumns'
import PaymentStatusLabel from '../../../components/Parts/PaymentStatusLabel'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'
import FormSection from '../../../components/Form/FormSection'
import FormItem from '../../../components/Form/FormItem'
import LinkButton from '../../../components/Parts/LinkButton'
import FormButton from '../../../components/Form/Button'

const ApplicationDetailContainer: React.FC = () => {
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdAsync,
    updateApplicationStatusByIdAsync,
    getLinksByApplicationIdOptionalAsync
  } = useApplication()
  const { getPaymentIdByHashId, getPayment } = usePayment()
  const { getEventByIdAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { checkIsAdminByOrganizationId } = useRole()
  const { formatByDate } = useDayjs()

  const { hashedAppId } = useParams()
  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [appId, setAppId] = useState<string>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [eventId, setEventId] = useState<string>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [links, setLinks] = useState<SockbaseApplicationLinksDocument | null>()
  const [circleCutURL, setCircleCutURL] = useState<string>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const onInitialize: () => void =
    () => {
      const fetchApplicationAsync: () => Promise<void> =
        async () => {
          if (!hashedAppId) return

          const fetchedAppId = await getApplicationIdByHashedIdAsync(hashedAppId)
          const fetchedApp = await getApplicationByIdAsync(fetchedAppId)

          const fetchedPaymentId = await getPaymentIdByHashId(hashedAppId)
          getPayment(fetchedPaymentId)
            .then(fetchedPayment => setPayment(fetchedPayment))
            .catch(err => { throw err })

          getCircleCutURLByHashedIdAsync(hashedAppId)
            .then(fetchedCircleCutURL => setCircleCutURL(fetchedCircleCutURL))
            .catch(err => { throw err })

          getLinksByApplicationIdOptionalAsync(fetchedAppId)
            .then(fetchedLinks => setLinks(fetchedLinks))
            .catch(err => { throw err })

          setAppId(fetchedAppId)
          setApp(fetchedApp)
          setEventId(fetchedApp.eventId)
        }
      fetchApplicationAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onInitialize, [hashedAppId, checkIsAdminByOrganizationId])

  const onFetchedApp = (): void => {
    const fetch = async (): Promise<void> => {
      if (!app) return

      getUserDataByUserIdAndEventIdAsync(app.userId, app.eventId)
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })

      const fetchedEvent = await getEventByIdAsync(app.eventId)
      const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)

      setEvent(fetchedEvent)
      setAdmin(fetchedIsAdmin)
    }
    fetch()
      .catch(err => { throw err })
  }
  useEffect(onFetchedApp, [app])

  const handleChangeStatus: (status: SockbaseApplicationStatus) => void =
    (status) => {
      if (!appId) return
      updateApplicationStatusByIdAsync(appId, status)
        .then(() => {
          alert('ステータスの変更に成功しました。')
          setApp(s => {
            if (!s) return
            return { ...s, meta: { ...s.meta, applicationStatus: status } }
          })
        })
        .catch(err => {
          throw err
        })
    }

  const title = useMemo(() => {
    if (!event) return '申し込み情報を読み込み中'
    return `${event.eventName} 申し込み情報`
  }, [event])

  const spaceName = useMemo(() => {
    if (!event || !app) return ''
    const spaceInfo = event.spaces.filter(s => s.id === app.spaceId)[0]
    return spaceInfo.name
  }, [event, app])

  const genreName = useMemo(() => {
    if (!event || !app) return ''
    const genreInfo = event.genres.filter(g => g.id === app.circle.genre)[0]
    return genreInfo.name
  }, [event, app])

  return (
    <DashboardLayout title={title}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        {isAdmin
          ? <>
            <li><Link to="/dashboard/events">管理イベント</Link></li>
            <li>{event?._organization.name}</li>
            <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName}</Link></li>
          </>
          : <>
            <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
            <li>{event ? event.eventName : <BlinkField />}</li>
          </>}
      </Breadcrumbs>

      <PageTitle
        icon={<MdEdit />}
        title={app?.circle.name}
        description="申し込み情報"
        isLoading={!app} />

      {payment?.status === 0 && <Alert type='danger' title='サークル参加費のお支払いをお願いいたします'>
        申し込み手続きを円滑に行うため<Link to="/dashboard/payments">こちら</Link>からお支払いをお願いいたします。
      </Alert>}

      {!links && event && <Alert type="danger" title="広報情報を入力してください">
        広報情報は<Link to={`/dashboard/applications/${hashedAppId}/links`}>こちら</Link>から入力できます。<br />
        カタログ等に掲載する情報は「<b>{formatByDate(event.schedules.fixedApplication, 'YYYY年M月D日 H時mm分')}</b>」時点のものとさせていただきます。
      </Alert>}

      <TwoColumnsLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込んだスペース</th>
                <td>{spaceName || <BlinkField />}</td>
              </tr>
              <tr>
                <th>申し込み状況</th>
                <td>{app && sockbaseShared.constants.application.statusText[app.meta.applicationStatus] || <BlinkField />}</td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>
                  <Link to="/dashboard/payments">
                    {(payment?.status !== undefined && <PaymentStatusLabel status={payment.status} />) || <BlinkField />}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>

          <h3>サークルカット</h3>
          {circleCutURL && <CircleCutImage src={circleCutURL} />}
          <p>
            サークルカットの変更は「お問い合わせ」よりご依頼ください。
          </p>

          <h3>サークル情報</h3>
          <table>
            <tbody>
              <tr>
                <th>サークル名</th>
                <td>{app?.circle.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>サークル名(よみ)</th>
                <td>{app?.circle.yomi ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>{app?.circle.penName ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>ペンネーム(よみ)</th>
                <td>{app?.circle.penNameYomi ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>頒布物情報</h3>
          <table>
            <tbody>
              <tr>
                <th>成人向け頒布物の有無</th>
                <td>{app
                  ? app.circle.hasAdult ? '成人向け頒布物があります' : '成人向け頒布物はありません'
                  : <BlinkField />}</td>
              </tr>
              <tr>
                <th>頒布物のジャンル</th>
                <td>{genreName || <BlinkField />}</td>
              </tr>
              <tr>
                <th>頒布物概要</th>
                <td>{app?.overview.description ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>総搬入量</th>
                <td>{app?.overview.totalAmount ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>隣接配置(合体)希望</h3>
          <table>
            <tbody>
              <tr>
                <th>合体希望サークル 合体申し込みID</th>
                <td>{app
                  ? app.unionCircleId || '(空欄)'
                  : <BlinkField />}</td>
              </tr>
              <tr>
                <th>プチオンリーコード</th>
                <td>{app
                  ? app.petitCode || '(空欄)'
                  : <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>申込み責任者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み責任者氏名</th>
                <td>{userData?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{userData?.email ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>申し込み情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込みID</th>
                <td>
                  {app
                    ? <>
                      {app.hashId} {app.hashId && <CopyToClipboard content={app.hashId} />}
                    </>
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>申し込み日時</th>
                <td>
                  {app
                    ? app.createdAt?.toLocaleString() ?? '-'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>
        </>

        <>
          {/* <h3>頒布物情報デジタル提出</h3>
          <p>
            入力されていません
          </p>
          <FormSection>
            <FormItem>
              <FormButton>頒布物情報の編集</FormButton>
            </FormItem>
          </FormSection> */}

          <h3>サークル広報情報</h3>
          <table>
            <tbody>
              <tr>
                <th>Twitter</th>
                <td>
                  {links
                    ? links?.twitterScreenName ? `@${links.twitterScreenName}` : '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>pixiv</th>
                <td>
                  {links
                    ? links?.pixivUserId ? `users/${links.pixivUserId}` : '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>Web</th>
                <td>
                  {links ?
                    links?.websiteURL || '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>お品書きURL</th>
                <td>
                  {links ?
                    links?.menuURL || '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          {links !== undefined && <FormSection>
            {!links && hashedAppId
              ? <FormItem>
                <LinkButton to={`/dashboard/applications/${hashedAppId}/links`}>サークル広報情報を入力</LinkButton>
              </FormItem>
              : <FormItem>
                <LinkButton to={`/dashboard/applications/${hashedAppId}/links`} color="default">サークル広報情報を編集</LinkButton>
              </FormItem>}
          </FormSection>}

          {isAdmin !== undefined && isAdmin && app && <>
            <h3>操作</h3>
            <FormSection>
              {app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.provisional &&
                <FormItem>
                  <FormButton
                    color="default"
                    onClick={() => handleChangeStatus(sockbaseShared.enumerations.application.status.provisional)}>仮申し込み状態にする</FormButton>
                </FormItem>}
              {app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.confirmed &&
                <FormItem>
                  <FormButton
                    color="info"
                    onClick={() => handleChangeStatus(sockbaseShared.enumerations.application.status.confirmed)}>申し込み確定状態にする</FormButton>
                </FormItem>}
              {app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.canceled &&
                <FormItem>
                  <FormButton
                    color="danger"
                    onClick={() => handleChangeStatus(sockbaseShared.enumerations.application.status.canceled)}>キャンセル状態にする</FormButton>
                </FormItem>}
            </FormSection>
          </>}

        </>
        <></>
      </TwoColumnsLayout>

      {/* <ApplicationDetail
        hashedAppId={hashedAppId}
        app={app}
        payment={payment}
        event={event}
        eventId={eventId}
        userData={userData}
        links={links}
        circleCutURL={circleCutURL}
        isAdmin={isAdmin}
        handleChangeStatus={handleChangeStatus} /> */}
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
