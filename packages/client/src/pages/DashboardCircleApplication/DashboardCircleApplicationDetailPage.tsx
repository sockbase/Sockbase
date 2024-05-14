import { useState, useEffect, useMemo, useCallback } from 'react'
import { MdBookmarkAdd, MdEdit, MdImage } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import sockbaseShared from 'shared'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CircleCutImage from '../../components/Parts/CircleCutImage'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/Parts/StatusLabel/PaymentStatusLabel'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useEvent from '../../hooks/useEvent'
import usePayment from '../../hooks/usePayment'
import useRole from '../../hooks/useRole'
import useUserData from '../../hooks/useUserData'
import type {
  SockbasePaymentDocument,
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationStatus,
  SockbaseEvent,
  SockbaseApplicationLinksDocument,
  SockbaseSpaceDocument,
  SockbaseEventSpace,
  SockbaseApplicationOverviewDocument
} from 'sockbase'

const DashboardCircleApplicationDetailPage: React.FC = () => {
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdAsync,
    updateApplicationStatusByIdAsync,
    getLinksByApplicationIdOptionalAsync,
    getOverviewByApplicationIdOptionalAsync,
    deleteApplicationAsync
  } = useApplication()
  const { getPaymentIdByHashId, getPaymentAsync } = usePayment()
  const { getEventByIdAsync, getSpaceOptionalAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { checkIsAdminByOrganizationId, isSystemAdmin } = useRole()
  const { formatByDate } = useDayjs()

  const { hashedAppId } = useParams()
  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [appId, setAppId] = useState<string>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [eventId, setEventId] = useState<string>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [links, setLinks] = useState<SockbaseApplicationLinksDocument | null>()
  const [overview, setOverview] = useState<SockbaseApplicationOverviewDocument | null>()
  const [space, setSpace] = useState<SockbaseSpaceDocument | null>()
  const [circleCutURL, setCircleCutURL] = useState<string>()
  const [isAdmin, setAdmin] = useState<boolean | null>()
  const [applicationDeleted, setApplicationDeleted] = useState(false)

  const now = useMemo(() => new Date().getTime(), [])

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

  const handleChangeStatus = useCallback((status: SockbaseApplicationStatus): void => {
    if (!appId || !isAdmin) return
    if (!confirm('ステータスを変更します。\nよろしいですか？')) return

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
  }, [appId, isAdmin])

  const handleDelete = useCallback(() => {
    if (!hashedAppId) return

    const promptAppId = prompt(`この申し込みを削除するには ${hashedAppId} と入力してください`)
    if (promptAppId === null) {
      return
    } else if (promptAppId !== hashedAppId) {
      alert('入力が間違っています')
      return
    }

    if (!confirm('※不可逆的操作です※\nこの申し込みを削除します。\nよろしいですか？')) return

    deleteApplicationAsync(hashedAppId)
      .then(() => {
        setApplicationDeleted(true)
        alert('削除が完了しました')
      })
      .catch(err => {
        alert('削除する際にエラーが発生しました')
        throw err
      })
  }, [hashedAppId])

  useEffect(() => {
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

        getOverviewByApplicationIdOptionalAsync(fetchedAppHashDoc.applicationId)
          .then(fetchedOverview => setOverview(fetchedOverview))
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
  }, [hashedAppId])

  useEffect(() => {
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
  }, [app, checkIsAdminByOrganizationId])

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

      {!links && event &&
        <Alert type="danger" title="カタログ掲載情報を入力してください">
          カタログ掲載情報は<Link to={`/dashboard/applications/${hashedAppId}/links`}>こちら</Link>から入力できます。<br />
          カタログに掲載する情報は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点のものとさせていただきます。
        </Alert>}

      {links && event && event.schedules.catalogInformationFixedAt > now &&
        <Alert type="danger" title="カタログ掲載情報締切にご注意ください">
          カタログ掲載情報の確定日は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> です。<br />
          確定日以降の情報は掲載されませんのでご注意ください。
        </Alert>}

      {event && event.schedules.overviewFirstFixedAt > now &&
        <Alert title="配置情報締切までに頒布物情報を更新してください">
          <b>{formatByDate(event.schedules.overviewFirstFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報で配置を行います。<br />
          申し込み時から大きく変更がある場合は必ず更新を行ってください。
        </Alert>}

      {event && event.schedules.overviewFirstFixedAt <= now && event.schedules.overviewFinalFixedAt > now &&
        <Alert title="頒布物情報を最新の状態にしてください">
          <b>{formatByDate(event.schedules.overviewFinalFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報をイベント運営で使用いたします。<br />
          実際に頒布する予定の情報をご入力いただきますようお願いいたします。
        </Alert>}

      {event && event.schedules.publishSpaces <= now && space && <Alert type="success" title="スペース配置情報">
        あなたのサークル「{app?.circle.name}」は <b>{space.spaceName}</b> に配置されています。
      </Alert>}

      <TwoColumnsLayout>
        <>
          <h3>申し込み基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td>{(app && <ApplicationStatusLabel status={app.meta.applicationStatus} />) || <BlinkField />}</td>
              </tr>
              {eventSpace?.productInfo && <tr>
                <th>お支払い状況</th>
                <td>
                  {(payment && (
                    payment?.status === 0
                      ? <Link to="/dashboard/payments">
                        <PaymentStatusLabel payment={payment} isLink={true}/>
                      </Link>
                      : <>
                        <PaymentStatusLabel payment={payment} />
                      </>)) ||
                      <BlinkField />}
                </td>
              </tr>}
              <tr>
                <th>申し込んだイベント</th>
                <td>{(event && `${event.eventName} ${formatByDate(event.schedules.startEvent, '(YYYY年 M月 D日 開催)')}`) || <BlinkField />}</td>
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
                      ? `配置発表は ${formatByDate(event.schedules.publishSpaces, 'YYYY年 M月 D日')} ごろを予定しています`
                      : space?.spaceName || '配置発表まで今しばらくお待ちください'
                    : <BlinkField />
                }</td>
              </tr>
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
          <h3>サークルカット, カタログ掲載情報</h3>
          <table>
            <tbody>
              <tr>
                <th>サークルカット</th>
                <td>
                  {circleCutURL && <a href={circleCutURL} target="_blank" rel="noreferrer">
                    <CircleCutImage src={circleCutURL} />
                  </a>}
                </td>
              </tr>
              <tr>
                <th>X (Twitter)</th>
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
            <FormItem inlined={true}>
              <LinkButton to={`/dashboard/applications/${hashedAppId}/cut`} color='default' inlined={true}>
                <IconLabel label="サークルカットを差し替える" icon={<MdImage />} />
              </LinkButton>
              <LinkButton to={`/dashboard/applications/${hashedAppId}/links`} color={links ? 'default' : undefined} inlined={true}>
                <IconLabel label={`カタログ掲載情報を${links ? '編集' : '入力'}する`} icon={<MdBookmarkAdd />} />
              </LinkButton>
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
                <td>{overview?.description ?? app?.overview.description ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>総搬入量</th>
                <td>{overview?.totalAmount ?? app?.overview.totalAmount ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
          {links !== undefined && hashedAppId && <FormSection>
            <FormItem inlined={true}>
              <LinkButton to={`/dashboard/applications/${hashedAppId}/overview`} color='default' inlined={true}>
                <IconLabel label="頒布物情報を編集する" icon={<MdEdit />} />
              </LinkButton>
            </FormItem>
          </FormSection>}
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

      {isSystemAdmin && <>
        <h2>システム管理操作</h2>
        <FormSection>
          <FormItem>
            <FormButton color="danger" onClick={handleDelete} disabled={applicationDeleted}>申し込み削除</FormButton>
          </FormItem>
        </FormSection>
      </>}
    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationDetailPage
