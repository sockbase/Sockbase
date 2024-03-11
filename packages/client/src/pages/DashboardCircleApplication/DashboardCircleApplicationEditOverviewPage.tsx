import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdEdit } from 'react-icons/md'
import {
  type SockbaseApplicationOverview,
  type SockbaseApplicationDocument,
  type SockbaseEvent
} from 'sockbase'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useRole from '../../hooks/useRole'
import useDayjs from '../../hooks/useDayjs'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/Label'
import FormTextarea from '../../components/Form/Textarea'
import FormHelp from '../../components/Form/Help'
import FormButton from '../../components/Form/Button'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import BlinkField from '../../components/Parts/BlinkField'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'

const DashboardCircleApplicationEditOverviewPage: React.FC = () => {
  const { hashedAppId } = useParams<{ hashedAppId: string }>()

  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getOverviewByApplicationIdOptionalAsync,
    setOverviewByApplicationIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { checkIsAdminByOrganizationId } = useRole()
  const { formatByDate } = useDayjs()

  const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [eventId, setEventId] = useState<string>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [isAdmin, setAdmin] = useState<boolean | null>()
  const [overview, setOverview] = useState<SockbaseApplicationOverview>()
  const [isProgress, setProgress] = useState(false)

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedAppId) return

      const fetchedAppHashDoc = await getApplicationIdByHashedIdAsync(hashedAppId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppHashDoc.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
      const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)

      const fetchedAppId = fetchedAppHashDoc.applicationId

      setAppId(fetchedAppId)
      setApp(fetchedApp)
      setEventId(fetchedApp.eventId)
      setEvent(fetchedEvent)
      setAdmin(fetchedIsAdmin)

      const fetchedOverview = await getOverviewByApplicationIdOptionalAsync(fetchedAppId)

      if (!fetchedOverview) {
        setOverview(fetchedApp.overview)
        return
      }

      setOverview({
        description: fetchedOverview.description,
        totalAmount: fetchedOverview.totalAmount
      })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [checkIsAdminByOrganizationId, hashedAppId])

  const errorCount = useMemo((): number => {
    const validators = [
      overview?.description,
      overview?.totalAmount
    ]

    return validators.filter(r => !r).length
  }, [overview])

  const handleSubmit = useCallback((): void => {
    if (!appId || !overview || errorCount !== 0) return
    setProgress(true)

    setOverviewByApplicationIdAsync(appId, overview)
      .then(() => { alert('更新しました') })
      .catch((err: Error) => {
        alert(`エラーが発生しました ${err.message}`)
      })
      .finally(() => setProgress(false))
  }, [appId, overview, errorCount])

  return (
    <DashboardBaseLayout title="頒布物概要編集" requireSystemRole={0}>
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
      <PageTitle title={app?.circle.name} description="頒布物概要編集" icon={<MdEdit />} isLoading={!app} />

      {app && event && overview
        ? <TwoColumnsLayout>
          <>
            {event && (event.schedules.fixedApplication < new Date().getTime())
              ? <>
                <Alert type="danger" title='カタログ掲載情報は締切済みです'>
                現在配置準備中です。今しばらくお待ちください。
                </Alert>

                <h3>頒布物概要</h3>
                <p>
                  {overview.description}
                </p>

                <h3>総搬入量</h3>
                <p>
                  {overview.totalAmount}
                </p>
              </>
              : <>
                <Alert>
                配置情報の入力締め切り日は「<b>{formatByDate(event.schedules.fixedApplication, 'YYYY年M月D日')}</b>」です。<br />
                締め切り日以降は編集できませんのでご注意ください。
                </Alert>
                <FormSection>
                  <FormItem>
                    <FormLabel>頒布物概要</FormLabel>
                    <FormTextarea
                      placeholder='◯◯◯◯と△△△△のシリアス系合同誌(小説, 漫画)を頒布する予定。その他グッズや既刊あり。'
                      value={overview.description}
                      onChange={e => setOverview(s => s && ({ ...s, description: e.target.value }))}
                      hasError={!overview.description} />
                    <FormHelp hasError={!overview.description}>
                      スペース配置の参考にしますので、キャラクター名等は正しく入力してください。<br />
                      合同誌企画がある場合はその旨も入力してください。
                    </FormHelp>
                  </FormItem>
                  <FormItem>
                    <Alert>
                      「頒布物概要」に記載された内容を元に配置します。<br />
                      サークルカットの内容は考慮されませんのでご注意ください。
                    </Alert>
                  </FormItem>
                </FormSection>
                <FormSection>
                  <FormItem>
                    <FormLabel>総搬入量</FormLabel>
                    <FormTextarea
                      placeholder='合同誌: 1種1,000冊, 既刊: 5種合計500冊, 色紙: 1枚, グッズ: 3種合計30個'
                      value={overview.totalAmount}
                      onChange={e => setOverview(s => s && ({ ...s, totalAmount: e.target.value }))}
                      hasError={!overview.totalAmount} />
                    <FormHelp hasError={!overview.totalAmount}>単位まで入力してください。</FormHelp>
                  </FormItem>
                  <FormItem>
                    <Alert>
                      搬入量が決まっていない場合は、最大の持ち込み予定数を入力してください。
                    </Alert>
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
              </>}
          </>
          <></>
        </TwoColumnsLayout>
        : <Loading text="頒布物概要" />}

    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationEditOverviewPage
