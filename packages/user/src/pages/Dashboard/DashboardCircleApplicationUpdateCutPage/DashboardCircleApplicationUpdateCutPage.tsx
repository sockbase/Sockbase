import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdPhoto } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbaseApplicationDocument,
  type SockbaseEvent
} from 'sockbase'
import FormButton from '../../../components/Form/FormButton'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import IconLabel from '../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import useFile from '../../../hooks/useFile'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardCircleApplicationUpdateCutPage: React.FC = () => {
  const { hashId } = useParams<{ hashId: string }>()
  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashIdNullableAsync,
    uploadCircleCutFileAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const {
    data: circleCutDataWithHook,
    openAsDataURL: openCircleCut
  } = useFile()
  const { formatByDate } = useDayjs()

  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()

  const [currentCircleCut, setCurrentCircleCut] = useState<string | null>()
  const [circleCutData, setCircleCutData] = useState<string | null>()
  const [circleCutFile, setCircleCutFile] = useState<File | null>()

  const [isProgress, setProgress] = useState(false)

  const now = useMemo(() => new Date().getTime(), [])

  const handleSubmit = useCallback(() => {
    if (!hashId || !circleCutFile) return

    setProgress(true)

    uploadCircleCutFileAsync(hashId, circleCutFile)
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
  }, [hashId, circleCutFile, circleCutDataWithHook])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashId) return

      const fetchedAppId = await getApplicationIdByHashIdAsync(hashId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppId.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
      const fetchedCircleCutURL = await getCircleCutURLByHashIdNullableAsync(hashId)

      setApp(fetchedApp)
      setEvent(fetchedEvent)
      setCurrentCircleCut(fetchedCircleCutURL)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!circleCutFile) return
    openCircleCut(circleCutFile)
  }, [circleCutFile])

  useEffect(() => {
    if (!circleCutDataWithHook) return
    setCircleCutData(circleCutDataWithHook)
  }, [circleCutDataWithHook])

  return (
    <DashboardBaseLayout title="サークルカット変更">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
        <li>{event?.name ?? <BlinkField />}</li>
        <li>
          {(hashId && app && <Link to={`/dashboard/applications/${hashId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
        </li>
      </Breadcrumbs>
      <PageTitle title={app?.circle.name} description="サークルカット変更" icon={<MdPhoto />} isLoading={!app} />

      <TwoColumnsLayout>
        <>
          {event && (
            event.schedules.catalogInformationFixedAt > now
              ? <Alert type="info" title="カタログ掲載情報締切にご注意ください">
                カタログ掲載情報の確定日は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> です。<br />
                確定日以降の情報は掲載されませんのでご注意ください。
              </Alert>
              : <Alert type="warning" title="カタログ掲載情報は締め切りました">
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
                <FormButton
                  color='primary'
                  onClick={handleSubmit}
                  disabled={!circleCutData || isProgress}>
                  <IconLabel icon={<MdPhoto />} label='サークルカットを変更する' />
                </FormButton>
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
