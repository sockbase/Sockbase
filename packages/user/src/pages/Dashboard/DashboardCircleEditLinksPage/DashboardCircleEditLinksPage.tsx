import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdBookmarkAdd, MdEdit } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseApplicationLinks, type SockbaseApplicationDocument, type SockbaseEvent } from 'sockbase'
import FormButton from '../../../components/Form/FormButton'
import FormHelp from '../../../components/Form/FormHelp'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import Loading from '../../../components/Parts/Loading'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import useValidate from '../../../hooks/useValidate'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardCircleEditLinksPage: React.FC = () => {
  const { hashId } = useParams<{ hashId: string }>()
  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const validator = useValidate()
  const { formatByDate } = useDayjs()

  const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()

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
  }, [appId, errorCount, links, setLinksByApplicationIdAsync])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashId) return

      const fetchedAppId = await getApplicationIdByHashIdAsync(hashId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppId.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)

      setAppId(fetchedAppId.applicationId)
      setApp(fetchedApp)
      setEvent(fetchedEvent)

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
  }, [hashId])

  return (
    <DashboardBaseLayout title="カタログ掲載情報編集">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
        <li>{event?.name ?? <BlinkField />}</li>
        <li>
          {(hashId && app && <Link to={`/dashboard/applications/${hashId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
        </li>
      </Breadcrumbs>
      <PageTitle
        description="カタログ掲載情報編集"
        icon={<MdBookmarkAdd />}
        isLoading={!app}
        title={app?.circle.name} />
      {app && event
        ? (
          <TwoColumnsLayout>
            <>
              {event && event.schedules.overviewFixedAt > now && (
                <Alert
                  title="頒布物情報を最新の状態にしてください"
                  type="info">
                  <b>{formatByDate(event.schedules.overviewFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報をカタログやイベント運営で使用いたします。<br />
                変更がある場合は、この日までに情報を更新してください。
                </Alert>
              )}

              <FormSection>
                <FormItem>
                  <FormLabel>X (Twitter)</FormLabel>
                  <FormInput
                    onChange={e => setLinks(s => ({ ...s, twitterScreenName: e.target.value }))}
                    placeholder="xxxxxxx"
                    value={links.twitterScreenName ?? ''} />
                  <FormHelp hasError={!!links.twitterScreenName && !validator.isTwitterScreenName(links.twitterScreenName)}>
                  @ を除いて入力してください
                  </FormHelp>
                </FormItem>
                <FormItem>
                  <FormLabel>pixiv</FormLabel>
                  <FormInput
                    onChange={e => setLinks(s => ({ ...s, pixivUserId: e.target.value }))}
                    placeholder="1234567890"
                    value={links.pixivUserId ?? ''} />
                  <FormHelp hasError={!!links.pixivUserId && !validator.isOnlyNumber(links.pixivUserId)}>
                  ID 部分のみを入力してください
                  </FormHelp>
                </FormItem>
                <FormItem>
                  <FormLabel>Web サイト</FormLabel>
                  <FormInput
                    onChange={e => setLinks(s => ({ ...s, websiteURL: e.target.value }))}
                    placeholder="https://sumire.sockbase.net"
                    value={links.websiteURL ?? ''} />
                  <FormHelp hasError={!!links.websiteURL && !validator.isURL(links.websiteURL)}>
                  http:// から始めてください
                  </FormHelp>
                </FormItem>
                <FormItem>
                  <FormLabel>お品書き URL</FormLabel>
                  <FormInput
                    onChange={e => setLinks(s => ({ ...s, menuURL: e.target.value }))}
                    placeholder="https://oshina.sockbase.net"
                    value={links.menuURL ?? ''} />
                  <FormHelp hasError={!!links.menuURL && !validator.isURL(links.menuURL)}>
                  http:// から始めてください
                  </FormHelp>
                </FormItem>
              </FormSection>

              {errorCount !== 0 && (
                <Alert
                  title={`${errorCount} 個の入力項目に不備があります。`}
                  type="error" />
              )}

              <FormSection>
                <FormItem>
                  <LoadingCircleWrapper
                    inlined={true}
                    isLoading={isProgress}>
                    <FormButton
                      color="primary"
                      disabled={isProgress || errorCount !== 0}
                      onClick={handleSubmit}>
                      <IconLabel
                        icon={<MdEdit />}
                        label="情報を更新する" />
                    </FormButton>
                  </LoadingCircleWrapper>
                </FormItem>
              </FormSection>
            </>
            <></>
          </TwoColumnsLayout>
        )
        : <Loading text="広報情報" />}
    </DashboardBaseLayout>
  )
}

export default DashboardCircleEditLinksPage
