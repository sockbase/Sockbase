import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdEdit } from 'react-icons/md'
import { type SockbaseApplicationLinks, type SockbaseApplicationDocument, type SockbaseEvent } from 'sockbase'

import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Alert from '../../components/Parts/Alert'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/Label'
import FormInput from '../../components/Form/Input'
import FormButton from '../../components/Form/Button'
import FormHelp from '../../components/Form/Help'

import useRole from '../../hooks/useRole'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useValidate from '../../hooks/useValidate'
import useDayjs from '../../hooks/useDayjs'
import BlinkField from '../../components/Parts/BlinkField'
import Loading from '../../components/Parts/Loading'

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

  const onInitialize = (): void => {
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
  }
  useEffect(onInitialize, [checkIsAdminByOrganizationId, hashedAppId])

  const errorCount = useMemo((): number => {
    const validators = [
      !links.twitterScreenName || validator.isTwitterScreenName(links.twitterScreenName),
      !links.pixivUserId || validator.isOnlyNumber(links.pixivUserId),
      !links.websiteURL || validator.isURL(links.websiteURL),
      !links.menuURL || validator.isURL(links.menuURL)
    ]

    return validators.filter(r => !r).length
  }, [links])

  const handleSubmit = (): void => {
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
  }

  return (
    <DashboardBaseLayout title="広報情報編集" requireSystemRole={0}>
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
      <PageTitle title={app?.circle.name} description="広報情報編集" icon={<MdEdit />} isLoading={!app} />
      {app && event
        ? <TwoColumnsLayout>
          <>
            {event && (event.schedules.fixedApplication <= new Date().getTime())
              ? <Alert type="danger" title='カタログ掲載情報は締切済みです'>
                オンライン掲載情報の更新は可能です。
              </Alert>
              : event && <Alert>
                カタログ掲載情報の確定日は「<b>{formatByDate(event.schedules.fixedApplication, 'YYYY年M月D日')}</b>」です。<br />
                確定日以降の情報は掲載されませんのでご注意ください。
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

            {/* {error && <Alert type="danger" title="エラーが発生しました">{error.message}</Alert>} */}
            {errorCount !== 0 && <Alert type="danger">{errorCount}個の入力項目に不備があります。</Alert>}

            <FormSection>
              <FormItem>
                <LoadingCircleWrapper isLoading={isProgress} inlined>
                  <FormButton
                    inlined
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
