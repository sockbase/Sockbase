import { useCallback, useEffect, useState } from 'react'
import { MdCheck, MdClose, MdEdit, MdOutlineDeleteForever, MdPendingActions } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import sockbaseShared from 'shared'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useRole from '../../hooks/useRole'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseApplicationHashIdDocument,
  SockbaseEventDocument,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseAccount,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationStatus
} from 'sockbase'

const CircleViewPage: React.FC = () => {
  const { hashId } = useParams()
  const {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getLinksByApplicationIdAsync,
    setApplicationStatusByIdAsync,
    deleteApplicationAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { isSystemAdmin } = useRole()

  const [appHash, setAppHash] = useState<SockbaseApplicationHashIdDocument>()
  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [appLinks, setAppLinks] = useState<SockbaseApplicationLinksDocument | null>()

  const [isDeletedApplication, setIsDeletedApplication] = useState(false)

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
    } else if (promptAppId !== hashId) {
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
  }, [appHash])

  return (
    <DefaultLayout title={app?.circle.name ?? 'サークル情報照会'} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${event?.id}`}>{event?.name}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEdit />}
        title={app?.circle.name}
        isLoading={!app} />

      <TwoColumnLayout>
        <>
          <h3>申し込み基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状態</th>
                <td><ApplicationStatusLabel status={app?.meta.applicationStatus} /></td>
              </tr>
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
                <td>{app?.spaceId ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>配置されたスペース</th>
                <td>- TBD -</td>
              </tr>
              <tr>
                <th>申し込み ID</th>
                <td>{app ? app.hashId || '- ! -' : <BlinkField />}</td>
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
                <td></td>
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
                <th>頒布物のジャンル</th>
                <td>{app?.circle.genre ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>頒布物概要</th>
                <td>{app?.overview.description ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>総搬入量</th>
                <td>{app?.overview.totalAmount ?? <BlinkField />}</td>
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
              <tr>
                <th>プチオンリーコード</th>
                <td>{app ? app.petitCode || '(空欄)' : <BlinkField />}</td>
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
        (空欄)
      </p>

      <TwoColumnLayout>
        <>
          <h3>操作</h3>
          <FormSection>
            <FormItem $inlined>
              {app?.meta.applicationStatus !== 2 && (
                <FormButton onClick={() => handleSetApplicationStatus(2)}>
                  <IconLabel icon={<MdCheck />} label='申し込み確定状態にする' />
                </FormButton>
              )}
              {app?.meta.applicationStatus !== 0 && (
                <FormButton onClick={() => handleSetApplicationStatus(0)}>
                  <IconLabel icon={<MdPendingActions />} label='仮申し込み状態にする' />
                </FormButton>
              )}
              {app?.meta.applicationStatus !== 1 && (
                <FormButton onClick={() => handleSetApplicationStatus(1)}>
                  <IconLabel icon={<MdClose />} label='キャンセル状態にする' />
                </FormButton>
              )}
            </FormItem>
          </FormSection>
        </>
        {isSystemAdmin && (
          <>
            <h3>システム操作</h3>
            <FormSection>
              <FormItem>
                <FormButton onClick={handleDeleteApplication} disabled={isDeletedApplication}>
                  <IconLabel icon={<MdOutlineDeleteForever />} label='申し込み情報を削除する' />
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
