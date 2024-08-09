import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdPhoto } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbaseApplicationDocument,
  type SockbaseEvent
} from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import useFile from '../../../hooks/useFile'
import useRole from '../../../hooks/useRole'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardCircleApplicationUpdateCutPage: React.FC = () => {
  const { hashedAppId } = useParams<{ hashedAppId: string }>()
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdNullableAsync,
    uploadCircleCutFileAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { checkIsAdminByOrganizationId } = useRole()
  const {
    data: circleCutDataWithHook,
    openAsDataURL: openCircleCut
  } = useFile()
  const { formatByDate } = useDayjs()

  // const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [eventId, setEventId] = useState<string>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const [currentCircleCut, setCurrentCircleCut] = useState<string | null>()
  const [circleCutData, setCircleCutData] = useState<string | null>()
  const [circleCutFile, setCircleCutFile] = useState<File | null>()

  const [isProgress, setProgress] = useState(false)

  const now = useMemo(() => new Date().getTime(), [])

  const handleSubmit = useCallback(() => {
    if (!hashedAppId || !circleCutFile) return

    setProgress(true)

    uploadCircleCutFileAsync(hashedAppId, circleCutFile)
      .then(() => {
        alert('サークルカットの変更が完了しました')
        setCurrentCircleCut(circleCutDataWithHook)
        setCircleCutData(null)
        setCircleCutFile(null)
      })
      .catch(err => {
        alert('サークルカットの変更に失敗しました')
        throw err
      })
      .finally(() => setProgress(false))
  }, [hashedAppId, circleCutFile, circleCutDataWithHook])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedAppId) return

      const fetchedAppId = await getApplicationIdByHashedIdAsync(hashedAppId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppId.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
      const fetchedCircleCutURL = await getCircleCutURLByHashedIdNullableAsync(hashedAppId)
      const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)

      // setAppId(fetchedAppId.applicationId)
      setApp(fetchedApp)
      setEventId(fetchedApp.eventId)
      setEvent(fetchedEvent)
      setCurrentCircleCut(fetchedCircleCutURL)
      setAdmin(fetchedIsAdmin)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [checkIsAdminByOrganizationId, hashedAppId])

  useEffect(() => {
    if (!circleCutFile) return
    openCircleCut(circleCutFile)
  }, [circleCutFile])

  useEffect(() => {
    if (!circleCutDataWithHook) return
    setCircleCutData(circleCutDataWithHook)
  }, [circleCutDataWithHook])

  return (
    <DashboardBaseLayout title="サークルカット変更" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        {isAdmin
          ? <>
            <li><Link to="/dashboard/events">管理イベント</Link></li>
            <li>{event?._organization.name ?? <BlinkField />}</li>
            <li><Link to={`/dashboard/events/${eventId}`}>{event?.name}</Link></li>
          </>
          : <>
            <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
            <li>{event?.name ?? <BlinkField />}</li>
          </>}
        <li>
          {(hashedAppId && app && <Link to={`/dashboard/applications/${hashedAppId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
        </li>
      </Breadcrumbs>
      <PageTitle title={app?.circle.name} description="サークルカット変更" icon={<MdPhoto />} isLoading={!app} />

      <TwoColumnsLayout>
        <>
          {event && (
            event.schedules.catalogInformationFixedAt > now
              ? <Alert type="danger" title="カタログ掲載情報締切にご注意ください">
                カタログ掲載情報の確定日は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> です。<br />
                確定日以降の情報は掲載されませんのでご注意ください。
              </Alert>
              : <Alert type="danger" title="カタログ掲載情報は締め切りました">
                カタログ掲載情報は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> に締め切りました。<br />
                更新してもカタログには反映されません。
              </Alert>)}

          <ul>
            <li>サークルカットを提出する際は、テンプレートを使用する必要があります。</li>
            <li>公序良俗に反する画像は使用できません。不特定多数の方の閲覧が可能なためご配慮をお願いいたします。</li>
          </ul>

          <FormSection>
            <FormItem>
              <FormLabel>サークルカット</FormLabel>
              <FormInput
                type="file"
                accept="image/*"
                onChange={e => setCircleCutFile(e.target.files?.[0])} />
            </FormItem>
            {circleCutData && <FormItem>
              <CircleCutImage src={circleCutData} />
            </FormItem>}
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress}>
                <FormButton onClick={handleSubmit} disabled={!circleCutData || isProgress}>更新</FormButton>
              </LoadingCircleWrapper>
            </FormItem>
          </FormSection>
        </>
        <>
          <h3>現在のサークルカット</h3>
          {currentCircleCut && <CircleCutImage src={currentCircleCut} />}
        </>
      </TwoColumnsLayout>

    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationUpdateCutPage
