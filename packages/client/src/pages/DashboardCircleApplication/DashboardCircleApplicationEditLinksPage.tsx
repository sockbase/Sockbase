import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdBookmarkAdd } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseApplicationLinks, type SockbaseApplicationDocument, type SockbaseEvent } from 'sockbase'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormHelp from '../../components/Form/Help'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Loading from '../../components/Parts/Loading'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useEvent from '../../hooks/useEvent'
import useRole from '../../hooks/useRole'
import useValidate from '../../hooks/useValidate'

const DashboardCircleApplicationEditLinksPage: React.FC = () => {
  const { hashedAppId } = useParams<{ hashedAppId: string }>()
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const validator = useValidate()
  const { checkIsAdminByOrganizationId } = useRole()
  const { formatByDate } = useDayjs()

  const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [eventId, setEventId] = useState<string>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const [links, setLinks] = useState<SockbaseApplicationLinks>({
    twitterScreenName: '',
    pixivUserId: '',
    websiteURL: '',
    menuURL: ''
  })

  const [isProgress, setProgress] = useState(false)

  const now = useMemo(() => new Date().getTime(), [])

  const errorCount = useMemo(() => {
    const validators = [
      !links.twitterScreenName || validator.isTwitterScreenName(links.twitterScreenName),
      !links.pixivUserId || validator.isOnlyNumber(links.pixivUserId),
      !links.websiteURL || validator.isURL(links.websiteURL),
      !links.menuURL || validator.isURL(links.menuURL)
    ]

    return validators.filter(r => !r).length
  }, [links])

  const handleSubmit = useCallback(() => {
    if (!appId || errorCount !== 0) return

    setProgress(true)

    setLinksByApplicationIdAsync(appId, links)
      .then(() => {
        alert('更新しました')
      })
      .catch((err: Error) => {
        alert(`エラーが発生しました ${err.message}`)
      })
      .finally(() => setProgress(false))
  }, [appId, errorCount, links])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedAppId) return

      const fetchedAppId = await getApplicationIdByHashedIdAsync(hashedAppId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppId.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
      const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)

      setAppId(fetchedAppId.applicationId)
      setApp(fetchedApp)
      setEventId(fetchedApp.eventId)
      setEvent(fetchedEvent)
      setAdmin(fetchedIsAdmin)

      const fetchedLinks = await getLinksByApplicationIdOptionalAsync(fetchedAppId.applicationId)
      if (!fetchedLinks) return

      setLinks({
        twitterScreenName: fetchedLinks.twitterScreenName,
        pixivUserId: fetchedLinks.pixivUserId,
        websiteURL: fetchedLinks.websiteURL,
        menuURL: fetchedLinks.menuURL
      })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [checkIsAdminByOrganizationId, hashedAppId])

  return (
    <DashboardBaseLayout title="カタログ掲載情報編集" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        {isAdmin
          ? <>
            <li><Link to="/dashboard/events">管理イベント</Link></li>
            <li>{event?._organization.name ?? <BlinkField />}</li>
            <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName}</Link></li>
          </>
          : <>
            <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
            <li>{event?.eventName ?? <BlinkField />}</li>
          </>}
        <li>
          {(hashedAppId && app && <Link to={`/dashboard/applications/${hashedAppId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
        </li>
      </Breadcrumbs>
      <PageTitle title={app?.circle.name} description="カタログ掲載情報編集" icon={<MdBookmarkAdd />} isLoading={!app} />
      {app && event
        ? <TwoColumnsLayout>
          <>
            {event.schedules.catalogInformationFixedAt > now &&
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

            <FormSection>
              <FormItem>
                <FormLabel>X (Twitter)</FormLabel>
                <FormInput
                  placeholder='xxxxxxx'
                  value={links.twitterScreenName ?? ''}
                  onChange={e => setLinks(s => ({ ...s, twitterScreenName: e.target.value }))} />
                <FormHelp hasError={!!links.twitterScreenName && !validator.isTwitterScreenName(links.twitterScreenName)}>
                  @を除いて入力してください
                </FormHelp>
              </FormItem>
              <FormItem>
                <FormLabel>pixiv</FormLabel>
                <FormInput
                  placeholder='1234567890'
                  value={links.pixivUserId ?? ''}
                  onChange={e => setLinks(s => ({ ...s, pixivUserId: e.target.value }))} />
                <FormHelp hasError={!!links.pixivUserId && !validator.isOnlyNumber(links.pixivUserId)}>
                  ID部分のみを入力してください
                </FormHelp>
              </FormItem>
              <FormItem>
                <FormLabel>Webサイト</FormLabel>
                <FormInput
                  placeholder='https://sumire.sockbase.net'
                  value={links.websiteURL ?? ''}
                  onChange={e => setLinks(s => ({ ...s, websiteURL: e.target.value }))} />
                <FormHelp hasError={!!links.websiteURL && !validator.isURL(links.websiteURL)}>
                  http://から始めてください
                </FormHelp>
              </FormItem>
              <FormItem>
                <FormLabel>お品書きURL</FormLabel>
                <FormInput
                  placeholder='https://oshina.sockbase.net'
                  value={links.menuURL ?? ''}
                  onChange={e => setLinks(s => ({ ...s, menuURL: e.target.value }))} />
                <FormHelp hasError={!!links.menuURL && !validator.isURL(links.menuURL)}>
                  http://から始めてください
                </FormHelp>
              </FormItem>
            </FormSection>

            {errorCount !== 0 && <Alert type="danger">{errorCount}個の入力項目に不備があります。</Alert>}

            <FormSection>
              <FormItem>
                <LoadingCircleWrapper isLoading={isProgress} inlined={true}>
                  <FormButton
                    inlined={true}
                    disabled={isProgress || errorCount !== 0}
                    onClick={handleSubmit}>情報を更新する</FormButton>
                </LoadingCircleWrapper>
              </FormItem>
            </FormSection>
          </>
          <></>
        </TwoColumnsLayout>
        : <Loading text="広報情報" />}
    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationEditLinksPage
