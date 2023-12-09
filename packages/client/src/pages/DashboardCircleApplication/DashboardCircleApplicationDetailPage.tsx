import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbasePaymentDocument,
  type SockbaseAccount,
  type SockbaseApplicationDocument,
  type SockbaseApplicationMeta,
  type SockbaseApplicationStatus,
  type SockbaseEvent,
  type SockbaseApplicationLinksDocument,
  type SockbaseSpaceDocument,
  type SockbaseEventSpace
} from 'sockbase'
import sockbaseShared from 'shared'
import { MdEdit } from 'react-icons/md'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import usePayment from '../../hooks/usePayment'
import useUserData from '../../hooks/useUserData'
import useRole from '../../hooks/useRole'
import useDayjs from '../../hooks/useDayjs'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Alert from '../../components/Parts/Alert'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import BlinkField from '../../components/Parts/BlinkField'
import PaymentStatusLabel from '../../components/Parts/StatusLabel/PaymentStatusLabel'
import CircleCutImage from '../../components/Parts/CircleCutImage'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import LinkButton from '../../components/Parts/LinkButton'
import FormButton from '../../components/Form/Button'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'

const DashboardCircleApplicationDetailPage: React.FC = () => {
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdAsync,
    updateApplicationStatusByIdAsync,
    getLinksByApplicationIdOptionalAsync
  } = useApplication()
  const { getPaymentIdByHashId, getPaymentAsync } = usePayment()
  const { getEventByIdAsync, getSpaceOptionalAsync } = useEvent()
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
  const [space, setSpace] = useState<SockbaseSpaceDocument | null>()
  const [circleCutURL, setCircleCutURL] = useState<string>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const onInitialize = (): void => {
    const fetchApplicationAsync: () => Promise<void> =
      async () => {
        if (!hashedAppId) return

        const fetchedAppHashDoc = await getApplicationIdByHashedIdAsync(hashedAppId)
        const fetchedApp = await getApplicationByIdAsync(fetchedAppHashDoc.applicationId)

        const fetchedPaymentId = await getPaymentIdByHashId(hashedAppId)
        getPaymentAsync(fetchedPaymentId)
          .then(fetchedPayment => setPayment(fetchedPayment))
          .catch(err => { throw err })

        getCircleCutURLByHashedIdAsync(hashedAppId)
          .then(fetchedCircleCutURL => setCircleCutURL(fetchedCircleCutURL))
          .catch(err => { throw err })

        getLinksByApplicationIdOptionalAsync(fetchedAppHashDoc.applicationId)
          .then(fetchedLinks => setLinks(fetchedLinks))
          .catch(err => { throw err })

        if (fetchedAppHashDoc.spaceId) {
          getSpaceOptionalAsync(fetchedAppHashDoc.spaceId)
            .then(fetchedSpace => setSpace(fetchedSpace))
            .catch(err => { throw err })
        }

        setAppId(fetchedAppHashDoc.applicationId)
        setApp(fetchedApp)
        setEventId(fetchedApp.eventId)
      }
    fetchApplicationAsync()
      .catch(err => {
        throw err
      })
  }
  useEffect(onInitialize, [hashedAppId])

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
  useEffect(onFetchedApp, [app, checkIsAdminByOrganizationId])

  const handleChangeStatus = (status: SockbaseApplicationStatus): void => {
    if (!appId || !isAdmin) return
    if (!confirm(`ステータスを変更します。\nよろしいですか？`)) return

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

  const eventSpace = useMemo((): SockbaseEventSpace | undefined => {
    if (!event || !app) return
    return event.spaces.filter(s => s.id === app.spaceId)[0]
  }, [event, app])

  const genreName = useMemo(() => {
    if (!event || !app) return ''
    const genreInfo = event.genres.filter(g => g.id === app.circle.genre)[0]
    return genreInfo.name
  }, [event, app])

  return (
    <DashboardBaseLayout title={title} requireSystemRole={0}>
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

      {space && <Alert type="success" title="スペース配置情報">
        あなたのサークル「{app?.circle.name}」は <b>{space.spaceName}</b> に配置されています。
      </Alert>}

      <TwoColumnsLayout>
        <>
          <h3>申し込み基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td>{app && <ApplicationStatusLabel status={app.meta.applicationStatus} /> || <BlinkField />}</td>
              </tr>
              <tr>
                <th>申し込んだイベント</th>
                <td>{event && `${event.eventName} ${formatByDate(event.schedules.startEvent, '(YYYY年M月D日 開催)')}` || <BlinkField />}</td>
              </tr>
              <tr>
                <th>サークル名</th>
                <td>
                  {app
                    ? <ruby>
                      {app.circle.name}
                      <rt>{app.circle.yomi}</rt>
                    </ruby>
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>
                  {app
                    ? <ruby>
                      {app.circle.penName}
                      <rt>{app.circle.penNameYomi}</rt>
                    </ruby>
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>申し込んだスペース</th>
                <td>{eventSpace?.name || <BlinkField />}</td>
              </tr>
              <tr>
                <th>配置されたスペース</th>
                <td>{
                  event
                    ? event.schedules.publishSpaces > new Date().getTime()
                      ? `配置発表は ${formatByDate(event.schedules.publishSpaces, 'YYYY年M月D日 H時mm分')} を予定しています`
                      : space?.spaceName || '配置発表まで今しばらくお待ちください'
                    : <BlinkField />
                }</td>
              </tr>
              {eventSpace?.productInfo && <tr>
                <th>お支払い状況</th>
                <td>
                  <Link to="/dashboard/payments">
                    {(payment?.status !== undefined && <PaymentStatusLabel payment={payment} />) || <BlinkField />}
                  </Link>
                </td>
              </tr>}
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
            </tbody>
          </table>
        </>
        <>
          <h3>サークルカット, 広報情報</h3>
          <table>
            <tbody>
              <tr>
                <th>サークルカット</th>
                <td>{circleCutURL && <CircleCutImage src={circleCutURL} />}</td>
              </tr>
              <tr>
                <th>X</th>
                <td>
                  {links !== undefined
                    ? links?.twitterScreenName ? `@${links.twitterScreenName}` : '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>pixiv</th>
                <td>
                  {links !== undefined
                    ? links?.pixivUserId ? `users/${links.pixivUserId}` : '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>Web</th>
                <td>
                  {links !== undefined
                    ? links?.websiteURL || '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>お品書きURL</th>
                <td>
                  {links !== undefined
                    ? links?.menuURL || '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          {links !== undefined && hashedAppId && <FormSection>
            <FormItem inlined>
              <LinkButton to={`/dashboard/applications/${hashedAppId}/cut`} color='default' inlined>サークルカット変更</LinkButton>
              <LinkButton to={`/dashboard/applications/${hashedAppId}/links`} color={links ? 'default' : undefined} inlined>広報情報{links ? '編集' : '入力'}</LinkButton>
            </FormItem>
          </FormSection>}

          {/* <h3>頒布物情報デジタル提出</h3>
          <p>
            入力されていません
          </p>
          <FormSection>
            <FormItem>
              <FormButton>頒布物情報の編集</FormButton>
            </FormItem>
          </FormSection> */}
        </>
        <>
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
        </>
        <>
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
        </>
        <>
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
        </>
      </TwoColumnsLayout>

      <h3>通信欄</h3>
      <p>
        {app ? (app.remarks || '(空欄)') : <BlinkField />}
      </p>

      {isAdmin !== undefined && isAdmin && app && <>
        <h2>操作</h2>
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
    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationDetailPage
