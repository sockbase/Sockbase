import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdClose, MdEdit, MdOpenInNew, MdOutlineDeleteForever, MdPendingActions } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import sockbaseShared from 'shared'
import {
  type SockbaseApplicationHashIdDocument,
  type SockbaseEventDocument,
  type SockbaseApplicationDocument,
  type SockbaseApplicationMeta,
  type SockbaseAccount,
  type SockbaseApplicationLinksDocument,
  type SockbaseApplicationStatus,
  type SockbaseSpaceDocument,
  type SockbasePaymentDocument,
  type SockbaseApplicationOverviewDocument
} from 'sockbase'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import PaymentStatusController from '../../components/Parts/PaymentStatusController'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/StatusLabel/PaymentStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import envHelper from '../../helpers/envHelper'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import usePayment from '../../hooks/usePayment'
import useRole from '../../hooks/useRole'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const CircleViewPage: React.FC = () => {
  const { hashId } = useParams()
  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getLinksByApplicationIdAsync,
    setApplicationStatusByIdAsync,
    deleteApplicationAsync,
    getCircleCutURLByHashIdNullableAsync,
    getOverviewByIdNullableAsync
  } = useApplication()
  const {
    getEventByIdAsync,
    getSpaceByIdNullableAsync
  } = useEvent()
  const { getPaymentByIdAsync } = usePayment()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { isSystemAdmin } = useRole()

  const [appHash, setAppHash] = useState<SockbaseApplicationHashIdDocument>()
  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [appLinks, setAppLinks] = useState<SockbaseApplicationLinksDocument | null>()
  const [circleCutURL, setCircleCutURL] = useState<string | null>()
  const [space, setSpace] = useState<SockbaseSpaceDocument | null>()
  const [payment, setPayment] = useState<SockbasePaymentDocument>()
  const [overview, setOverview] = useState<SockbaseApplicationOverviewDocument | null>()

  const [isDeletedApplication, setIsDeletedApplication] = useState(false)

  const spaceType = useMemo(() => {
    return event?.spaces?.find(s => s.id === app?.spaceId)
  }, [event, app])

  const genreType = useMemo(() => {
    return event?.genres.find(g => g.id === app?.circle.genre)
  }, [event, app])

  const handleSetApplicationStatus = useCallback((status: SockbaseApplicationStatus) => {
    if (!appHash) return
    if (!confirm(`申し込み状態を ${sockbaseShared.constants.application.statusText[status]} に変更します。\nよろしいですか？`)) return
    setApplicationStatusByIdAsync(appHash.applicationId, status)
      .then(() => {
        setApp(s => s && ({ ...s, meta: { ...s.meta, applicationStatus: status } }))
        alert('申し込み状態を変更しました')
      })
      .catch(err => { throw err })
  }, [appHash])

  const handleDeleteApplication = useCallback(() => {
    if (!hashId) return

    const promptAppId = prompt(`この申し込みを削除するには ${hashId} と入力してください`)
    if (promptAppId === null) {
      return
    }
    else if (promptAppId !== hashId) {
      alert('入力が間違っています')
      return
    }

    if (!confirm('※不可逆的操作です※\nこの申し込みを削除します。\nよろしいですか？')) return

    deleteApplicationAsync(hashId)
      .then(() => {
        setIsDeletedApplication(true)
        alert('削除が完了しました')
      })
      .catch(err => {
        alert('削除する際にエラーが発生しました')
        throw err
      })
  }, [hashId])

  useEffect(() => {
    if (!hashId) return
    getApplicationIdByHashIdAsync(hashId)
      .then(setAppHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!appHash) return
    getApplicationByIdAsync(appHash.applicationId)
      .then(setApp)
      .catch(err => { throw err })
    getEventByIdAsync(appHash.eventId)
      .then(setEvent)
      .catch(err => { throw err })
    getUserDataByUserIdAndEventIdAsync(appHash.userId, appHash.eventId)
      .then(setUserData)
      .catch(err => { throw err })
    getLinksByApplicationIdAsync(appHash.applicationId)
      .then(setAppLinks)
      .catch(err => { throw err })
    getCircleCutURLByHashIdNullableAsync(appHash.hashId)
      .then(setCircleCutURL)
      .catch(err => { throw err })
    getPaymentByIdAsync(appHash.paymentId)
      .then(setPayment)
      .catch(err => { throw err })
    getOverviewByIdNullableAsync(appHash.applicationId)
      .then(setOverview)
      .catch(err => { throw err })

    if (appHash.spaceId) {
      getSpaceByIdNullableAsync(appHash.spaceId)
        .then(setSpace)
        .catch(err => { throw err })
    }
    else {
      setSpace(null)
    }
  }, [appHash])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title={app?.circle.name ?? 'サークル情報照会'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${event?.id}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEdit />}
        isLoading={!app}
        title={app?.circle.name} />

      <FormSection>
        <FormItem>
          <AnchorButton
            href={`${envHelper.userAppURL}/dashboard/applications/${hashId}`}
            target="_blank">
            <IconLabel
              icon={<MdOpenInNew />}
              label="ユーザ画面で開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <TwoColumnLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状態</th>
                <td><ApplicationStatusLabel status={app?.meta.applicationStatus} /></td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>
                  {(payment && (
                    <PaymentStatusLabel
                      isShowBrand
                      payment={payment} />
                  )) ?? <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          <h3>基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>サークル名</th>
                <td>
                  <ruby>
                    {app?.circle.name ?? <BlinkField />}
                    <rt>{app?.circle.yomi}</rt>
                  </ruby>
                </td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>
                  <ruby>
                    {app?.circle.penName ?? <BlinkField />}
                    <rt>{app?.circle.penNameYomi}</rt>
                  </ruby>
                </td>
              </tr>
              <tr>
                <th>申し込んだスペース</th>
                <td>{spaceType?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>配置されたスペース</th>
                <td>{space !== undefined ? space?.spaceName || '---' : <BlinkField />}</td>
              </tr>
              <tr>
                <th>ID</th>
                <td>
                  {app
                    ? (
                      <>
                        {app.hashId} <CopyToClipboard content={app.hashId} />
                      </>
                    )
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>内部 ID</th>
                <td>{app?.id ?? <BlinkField />}  <CopyToClipboard content={app?.id} /></td>
              </tr>
              <tr>
                <th>決済 ID</th>
                <td>{payment?.id ?? <BlinkField />}  <CopyToClipboard content={payment?.id} /></td>
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
                  {circleCutURL ? <CircleCutImage src={circleCutURL} /> : '未提出'}
                </td>
              </tr>
              <tr>
                <th>X</th>
                <td>{appLinks ? appLinks.twitterScreenName || '(空欄)' : <BlinkField />}</td>
              </tr>
              <tr>
                <th>pixiv</th>
                <td>{appLinks ? appLinks.pixivUserId || '(空欄)' : <BlinkField />}</td>
              </tr>
              <tr>
                <th>Web</th>
                <td>{appLinks ? appLinks.websiteURL || '(空欄)' : <BlinkField />}</td>
              </tr>
              <tr>
                <th>お品書き URL</th>
                <td>{appLinks ? appLinks.menuURL || '(空欄)' : <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>頒布物情報</h3>
          <table>
            <tbody>
              <tr>
                <th>成人向け頒布物の有無</th>
                <td>
                  {app ? app.circle.hasAdult ? '有り' : '無し' : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>配置希望ジャンル・カテゴリ</th>
                <td>{genreType?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>ジャンルコード・プチオンリーコード</th>
                <td>{app ? app.petitCode || '(空欄)' : <BlinkField />}</td>
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
        </>
        <>
          <h3>隣接配置 (合体) 希望</h3>
          <table>
            <tbody>
              <tr>
                <th>合体申し込み ID</th>
                <td>{app ? app.unionCircleId || '(空欄)' : <BlinkField />}</td>
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
      </TwoColumnLayout>

      <h3>通信欄</h3>
      <p>
        {app ? app.remarks || '(空欄)' : <BlinkField />}
      </p>

      <TwoColumnLayout>
        <>
          <h3>操作</h3>
          <FormSection>
            <FormItem $inlined>
              {app?.meta.applicationStatus !== 2 && (
                <FormButton onClick={() => handleSetApplicationStatus(2)}>
                  <IconLabel
                    icon={<MdCheck />}
                    label="申し込み確定状態にする" />
                </FormButton>
              )}
              {app?.meta.applicationStatus !== 0 && (
                <FormButton onClick={() => handleSetApplicationStatus(0)}>
                  <IconLabel
                    icon={<MdPendingActions />}
                    label="仮申し込み状態にする" />
                </FormButton>
              )}
              {app?.meta.applicationStatus !== 1 && (
                <FormButton onClick={() => handleSetApplicationStatus(1)}>
                  <IconLabel
                    icon={<MdClose />}
                    label="キャンセル状態にする" />
                </FormButton>
              )}
            </FormItem>
          </FormSection>

          <PaymentStatusController
            onChange={st => {
              setPayment(s => s && ({ ...s, status: st }))
              alert('支払いステータスを変更しました')
            }}
            paymentId={payment?.id}
            status={payment?.status} />
        </>

        {isSystemAdmin && (
          <>
            <h3>システム操作</h3>
            <FormSection>
              <FormItem>
                <FormButton
                  disabled={isDeletedApplication}
                  onClick={handleDeleteApplication}>
                  <IconLabel
                    icon={<MdOutlineDeleteForever />}
                    label="申し込み情報を削除する" />
                </FormButton>
              </FormItem>
            </FormSection>
          </>
        )}
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default CircleViewPage

const CircleCutImage = styled.img`
  width: 100%;
`
