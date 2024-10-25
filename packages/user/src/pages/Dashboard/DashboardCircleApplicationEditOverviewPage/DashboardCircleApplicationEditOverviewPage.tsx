import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormHelp from '../../../components/Form/Help'
import FormLabel from '../../../components/Form/Label'
import FormTextarea from '../../../components/Form/Textarea'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import Loading from '../../../components/Parts/Loading'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type {
  SockbaseApplicationOverview,
  SockbaseApplicationDocument,
  SockbaseEvent
} from 'sockbase'

const DashboardCircleApplicationEditOverviewPage: React.FC = () => {
  const { hashedAppId } = useParams<{ hashedAppId: string }>()

  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getOverviewByApplicationIdOptionalAsync,
    setOverviewByApplicationIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { formatByDate } = useDayjs()

  const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [overview, setOverview] = useState<SockbaseApplicationOverview>()
  const [isProgress, setProgress] = useState(false)

  const now = useMemo(() => new Date().getTime(), [])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedAppId) return

      const fetchedAppHashDoc = await getApplicationIdByHashedIdAsync(hashedAppId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppHashDoc.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)

      const fetchedAppId = fetchedAppHashDoc.applicationId

      setAppId(fetchedAppId)
      setApp(fetchedApp)
      setEvent(fetchedEvent)

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
  }, [hashedAppId])

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
  }, [appId, overview, errorCount, setOverviewByApplicationIdAsync])

  return (
    <DashboardBaseLayout title="頒布物情報編集" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
        <li>{event?.name ?? <BlinkField />}</li>
        <li>
          {(hashedAppId && app && <Link to={`/dashboard/applications/${hashedAppId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
        </li>
      </Breadcrumbs>
      <PageTitle title={app?.circle.name} description="頒布物情報編集" icon={<MdEdit />} isLoading={!app} />

      {(!app || !event || !overview) && <Loading text="頒布物概要" />}

      {app && event && overview &&
        <TwoColumnsLayout>
          <>
            {event.schedules.catalogInformationFixedAt > now &&
              <Alert type="info" title="カタログ掲載情報締切にご注意ください">
                カタログ掲載情報の確定日は <b>{formatByDate(event.schedules.catalogInformationFixedAt - 1, 'YYYY年 M月 D日')}</b> です。<br />
                確定日以降の情報は掲載されませんのでご注意ください。
              </Alert>}

            {event.schedules.overviewFirstFixedAt > now &&
              <Alert type="info" title="配置情報締切までに頒布物情報を更新してください">
                <b>{formatByDate(event.schedules.overviewFirstFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報で配置を行います。<br />
                申し込み時から大きく変更がある場合は必ず更新を行ってください。
              </Alert>}

            {event.schedules.overviewFirstFixedAt <= now && event.schedules.overviewFinalFixedAt > now &&
              <Alert type="info" title="頒布物情報を最新の状態にしてください">
                <b>{formatByDate(event.schedules.overviewFinalFixedAt - 1, 'YYYY年 M月 D日')}</b> 時点の情報をイベント運営で使用いたします。<br />
                実際に頒布する作品の情報をご入力いただきますようお願いいたします。
              </Alert>}

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
                <Alert type="info" title="「頒布物概要」に記載された内容を元に配置します。">
                  サークルカットの内容は考慮されませんのでご注意ください。
                </Alert>
              </FormItem>
            </FormSection>

            <FormSection>
              <FormItem>
                <FormLabel>総搬入量</FormLabel>
                <FormTextarea
                  placeholder='合同誌: 1 種 1,000 冊, 既刊: 5 種合計 500 冊, 色紙: 1 枚, グッズ: 3 種合計 30 個'
                  value={overview.totalAmount}
                  onChange={e => setOverview(s => s && ({ ...s, totalAmount: e.target.value }))}
                  hasError={!overview.totalAmount} />
                <FormHelp hasError={!overview.totalAmount}>単位まで入力してください。</FormHelp>
              </FormItem>
              <FormItem>
                <Alert type="info" title="搬入量が決まっていない場合は、最大の持ち込み予定数を入力してください。" />
              </FormItem>
            </FormSection>

            {errorCount !== 0 && <Alert type="error" title={`${errorCount} 個の入力項目に不備があります。`} />}

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
        </TwoColumnsLayout>}
    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationEditOverviewPage
