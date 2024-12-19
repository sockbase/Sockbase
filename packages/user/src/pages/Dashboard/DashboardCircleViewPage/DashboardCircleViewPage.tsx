import { useState, useEffect, useMemo } from 'react'
import { MdBookmarkAdd, MdEdit, MdImage, MdLink } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'
import IconLabel from '../../../components/Parts/IconLabel'
import LinkButton from '../../../components/Parts/LinkButton'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import usePayment from '../../../hooks/usePayment'
import useUserData from '../../../hooks/useUserData'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type {
  SockbasePaymentDocument,
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseEvent,
  SockbaseApplicationLinksDocument,
  SockbaseSpaceDocument,
  SockbaseApplicationOverviewDocument
} from 'sockbase'

const DashboardCircleViewPage: React.FC = () => {
  const { hashId } = useParams()

  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashIdNullableAsync,
    getLinksByApplicationIdOptionalAsync,
    getOverviewByApplicationIdOptionalAsync
  } = useApplication()
  const { getPaymentIdByHashId, getPaymentAsync } = usePayment()
  const { getEventByIdAsync, getSpaceOptionalAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { formatByDate } = useDayjs()

  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [links, setLinks] = useState<SockbaseApplicationLinksDocument | null>()
  const [overview, setOverview] = useState<SockbaseApplicationOverviewDocument | null>()
  const [space, setSpace] = useState<SockbaseSpaceDocument | null>()
  const [circleCutURL, setCircleCutURL] = useState<string | null>()

  const now = useMemo(() => new Date().getTime(), [])

  const title = useMemo(() => {
    if (!event) return '申し込み情報を読み込み中'
    return `${event.name} 申し込み情報`
  }, [event])

  const eventSpace = useMemo(() => {
    if (!event || !app) return
    return event.spaces.find(s => s.id === app.spaceId)
  }, [event, app])

  const genreName = useMemo(() => {
    if (!event || !app) return ''
    const genreInfo = event.genres.filter(g => g.id === app.circle.genre)[0]
    return genreInfo.name
  }, [event, app])

  useEffect(() => {
    const fetchApplicationAsync: () => Promise<void> =
      async () => {
        if (!hashId) return

        const fetchedAppHashDoc = await getApplicationIdByHashIdAsync(hashId)
        const fetchedApp = await getApplicationByIdAsync(fetchedAppHashDoc.applicationId)

        const fetchedPaymentId = await getPaymentIdByHashId(hashId)
        getPaymentAsync(fetchedPaymentId)
          .then(fetchedPayment => setPayment(fetchedPayment))
          .catch(err => { throw err })

        getCircleCutURLByHashIdNullableAsync(hashId)
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

        setApp(fetchedApp)
      }
    fetchApplicationAsync()
      .catch(err => {
        throw err
      })
  }, [hashId])

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      if (!app) return

      getUserDataByUserIdAndEventIdAsync(app.userId, app.eventId)
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })

      const fetchedEvent = await getEventByIdAsync(app.eventId)
      setEvent(fetchedEvent)
    }
    fetch()
      .catch(err => { throw err })
  }, [app])

  return (
    <DashboardBaseLayout title={title}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
        <li>{event ? event.name : <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        description="申し込み情報"
        icon={<MdEdit />}
        isLoading={!app}
        title={app?.circle.name} />

      <FormSection>
        <FormItem $inlined>
          <LinkButton to={`/dashboard/applications/${hashId}/view-links`}>
            <IconLabel
              icon={<MdLink />}
              label="資料リンク確認" />
          </LinkButton>
        </FormItem>
      </FormSection>

      {payment?.status === 0 && (
        <Alert
          title="サークル参加費のお支払いをお願いいたします"
          type="warning">
          お支払いは <Link to="/dashboard/payments">決済履歴</Link> からお願いいたします。
        </Alert>
      )}

      {circleCutURL === null && event && (
        <Alert
          title="サークルカットを提出してください"
          type="warning">
          サークルカットは <Link to={`/dashboard/applications/${hashId}/cut`}>こちら</Link> から提出できます。
        </Alert>
      )}

      {!links && event && (
        <Alert
          title="カタログ掲載情報を入力してください"
          type="warning">
          カタログ掲載情報は <Link to={`/dashboard/applications/${hashId}/links`}>こちら</Link> から入力できます。
        </Alert>
      )}

      {event && event.schedules.overviewFixedAt > now && (
        <Alert
          title="頒布物情報を最新の状態にしてください"
          type="info">
          <b>{formatByDate(event.schedules.overviewFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報をカタログやイベント運営で使用いたします。<br />
          変更がある場合は、この日までに情報を更新してください。
        </Alert>
      )}

      {event && event.schedules.publishSpaces <= now && space && (
        <Alert
          title="スペース配置情報"
          type="success">
        あなたのサークル「{app?.circle.name}」は <b>{space.spaceName}</b> に配置されています。
        </Alert>
      )}

      <TwoColumnsLayout>
        <>
          <h3>申し込み基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td>{(app && <ApplicationStatusLabel status={app.meta.applicationStatus} />) || <BlinkField />}</td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>
                  {payment !== undefined
                    ? payment !== null
                      ? payment.status === 0
                        ? (
                          <Link to="/dashboard/payments">
                            <PaymentStatusLabel payment={payment} />
                          </Link>
                        )
                        : <PaymentStatusLabel payment={payment} />
                      : 'お支払いいただく必要はありません'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>申し込んだイベント</th>
                <td>{(event && `${event.name} ${formatByDate(event.schedules.startEvent, '(YYYY年 M月 D日 開催)')}`) || <BlinkField />}</td>
              </tr>
              <tr>
                <th>サークル名</th>
                <td>
                  {app
                    ? (
                      <ruby>
                        {app.circle.name}
                        <rt>{app.circle.yomi}</rt>
                      </ruby>
                    )
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>
                  {app
                    ? (
                      <ruby>
                        {app.circle.penName}
                        <rt>{app.circle.penNameYomi}</rt>
                      </ruby>
                    )
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
                }
                </td>
              </tr>
              <tr>
                <th>申し込みID</th>
                <td>
                  {app
                    ? (
                      <>
                        {app.hashId} {app.hashId && <CopyToClipboard content={app.hashId} />}
                      </>
                    )
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
                  {circleCutURL
                    ? (
                      <a
                        href={circleCutURL}
                        rel="noreferrer"
                        target="_blank">
                        <CircleCutImage src={circleCutURL} />
                      </a>
                    )
                    : circleCutURL === null
                      ? <Link to={`/dashboard/applications/${hashId}/cut`}>サークルカットを提出</Link>
                      : <></>}
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
                <th>お品書き URL</th>
                <td>
                  {links !== undefined
                    ? links?.menuURL || '(未入力)'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          {links !== undefined && hashId && (
            <FormSection>
              <FormItem $inlined>
                <LinkButton to={`/dashboard/applications/${hashId}/cut`}>
                  <IconLabel
                    icon={<MdImage />}
                    label="サークルカットを差し替える" />
                </LinkButton>
                <LinkButton
                  color={(!links && 'primary') || undefined}
                  to={`/dashboard/applications/${hashId}/links`}>
                  <IconLabel
                    icon={<MdBookmarkAdd />}
                    label={`カタログ掲載情報を${links ? '編集' : '入力'}する`} />
                </LinkButton>
              </FormItem>
            </FormSection>
          )}
        </>
        <>
          <h3>頒布物情報</h3>
          <table>
            <tbody>
              <tr>
                <th>成人向け頒布物の有無</th>
                <td>{app
                  ? app.circle.hasAdult ? '成人向け頒布物があります' : '成人向け頒布物はありません'
                  : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>配置希望ジャンル</th>
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
          {links !== undefined && hashId && (
            <FormSection>
              <FormItem>
                <LinkButton to={`/dashboard/applications/${hashId}/overview`}>
                  <IconLabel
                    icon={<MdEdit />}
                    label="頒布物情報を編集する" />
                </LinkButton>
              </FormItem>
            </FormSection>
          )}
        </>
        <>
          <h3>隣接配置 (合体) 希望</h3>
          <table>
            <tbody>
              <tr>
                <th>合体希望サークル 合体申し込みID</th>
                <td>{app
                  ? app.unionCircleId || '(空欄)'
                  : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>プチオンリーコード</th>
                <td>{app
                  ? app.petitCode || '(空欄)'
                  : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>申し込み責任者情報</h3>
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
    </DashboardBaseLayout>
  )
}

export default DashboardCircleViewPage
