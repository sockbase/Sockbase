import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import {
  type SockbaseEvent,
  type SockbaseApplicationDocument,
  type SockbaseApplicationLinksDocument,
  type SockbaseAccount,
  type SockbaseApplicationMeta,
  type SockbasePaymentDocument,
  type SockbaseEventSpace,
  type SockbaseApplicationHashIdDocument,
  type SockbaseSpaceDocument,
  type SockbaseEventGenre,
  type SockbaseApplicationStatus,
  type PaymentStatus
} from 'sockbase'
import { MdEdit } from 'react-icons/md'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useUserData from '../../hooks/useUserData'
import usePayment from '../../hooks/usePayment'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'
import TwoColumnLayout from '../../components/Layouts/TwoColumnLayout/TwoColumnLayout'

const ApplicationDetailPage: React.FC = () => {
  const { appHashId } = useParams<{ appHashId: string }>()
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdAsync,
    getLinksByApplicationIdOptionalAsync,
    getApplicationMetaByIdAsync
  } = useApplication()
  const { getPaymentAsync } = usePayment()
  const { getEventByIdAsync, getSpaceAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()

  const [appHash, setAppHash] = useState<SockbaseApplicationHashIdDocument>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [circleCutURL, setCircleCutURL] = useState<string>()
  const [appLinks, setAppLinks] = useState<SockbaseApplicationLinksDocument | null>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [appMeta, setAppMeta] = useState<SockbaseApplicationMeta>()
  const [payment, setPayment] = useState<SockbasePaymentDocument>()
  const [space, setSpace] = useState<SockbaseSpaceDocument>()

  const getSpace = useCallback((spaceId: string): SockbaseEventSpace | null => {
    if (!event) return null
    return event.spaces.filter(s => s.id === spaceId)[0]
  }, [event])

  const getGenre = useCallback((genreId: string): SockbaseEventGenre | null => {
    if (!event) return null
    return event.genres.filter(g => g.id === genreId)[0]
  }, [event])

  const getApplicationStatusText = useCallback((status: SockbaseApplicationStatus): string => {
    if (status === 0) {
      return '仮申し込み'
    } else if (status === 1) {
      return 'キャンセル済み'
    } else if (status === 2) {
      return '申し込み確定'
    } else {
      return status
    }
  }, [])

  const getPaymentStatusText = useCallback((status: PaymentStatus): string => {
    if (status === 0) {
      return '支払い待ち'
    } else if (status === 1) {
      return '支払い済み'
    } else if (status === 2) {
      return '返金済み'
    } else if (status === 3) {
      return '支払い失敗'
    } else if (status === 4) {
      return 'キャンセル済み'
    } else {
      return status
    }
  }, [])

  const onInitialize = (): void => {
    const fetchApplicationAsync = async (): Promise<void> => {
      if (!appHashId) return

      const fetchedAppHash = await getApplicationIdByHashedIdAsync(appHashId)
      setAppHash(fetchedAppHash)

      getCircleCutURLByHashedIdAsync(appHashId)
        .then(fetchedURL => setCircleCutURL(fetchedURL))
        .catch(err => { throw err })

      getApplicationByIdAsync(fetchedAppHash.applicationId)
        .then(fetchedApp => setApp(fetchedApp))
        .catch(err => { throw err })

      getLinksByApplicationIdOptionalAsync(fetchedAppHash.applicationId)
        .then(fetchedLinks => setAppLinks(fetchedLinks))
        .catch(err => { throw err })

      getApplicationMetaByIdAsync(fetchedAppHash.applicationId)
        .then(fetchedMeta => setAppMeta(fetchedMeta))
        .catch(err => { throw err })

      if (fetchedAppHash.spaceId) {
        getSpaceAsync(fetchedAppHash.spaceId)
          .then(fetchedSpace => setSpace(fetchedSpace))
          .catch(err => { throw err })
      }
    }
    fetchApplicationAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [appHashId])

  const onAppFetched = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!app) return

      getEventByIdAsync(app.eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getUserDataByUserIdAndEventIdAsync(app.userId, app.eventId)
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onAppFetched, [app])

  const onEventFetched = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!app || !appHash) return

      const space = getSpace(app.spaceId)
      if (space?.productInfo && appHash.paymentId) {
        getPaymentAsync(appHash.paymentId)
          .then(fetchedPayment => setPayment(fetchedPayment))
          .catch(err => { throw err })
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onEventFetched, [app, appHash, getSpace])

  return <MainLayout title={app?.circle.name ?? '読み込み中'} subTitle="申し込み情報照会" icon={<MdEdit />}>
    <h2>申し込み情報</h2>
    <TwoColumnLayout>
      <>
        <h3>申し込み基礎情報</h3>
        <table>
          <tbody>
            <tr>
              <th>申込状況</th>
              <td>{appMeta && getApplicationStatusText(appMeta.applicationStatus)}</td>
            </tr>
            {app && getSpace(app.spaceId) && <tr>
              <th>支払状況</th>
              <td>{payment && getPaymentStatusText(payment.status)}</td>
            </tr>}
            <tr>
              <th>イベント</th>
              <td>{event?.eventName}</td>
            </tr>
            <tr>
              <th>サークル名</th>
              <td>
                <ruby>
                  {app?.circle.name}
                  <rt>{app?.circle.yomi}</rt>
                </ruby>
              </td>
            </tr>
            <tr>
              <th>ペンネーム</th>
              <td>
                <ruby>
                  {app?.circle.penName}
                  <rt>{app?.circle.penNameYomi}</rt>
                </ruby>
              </td>
            </tr>
            <tr>
              <th>申込sp.</th>
              <td>{app && getSpace(app.spaceId)?.name}</td>
            </tr>
            <tr>
              <th>配置sp.</th>
              <td>{space?.spaceName}</td>
            </tr>
            <tr>
              <th>申込ID</th>
              <td>{appHashId}</td>
            </tr>
          </tbody>
        </table>
      </>
      <>
        <h3>サークルカット, 広報情報</h3>
        <table>
          <tbody>
            <tr>
              <th>サークルカット</th>
              <td>{circleCutURL && <CircleCutImage src={circleCutURL} />}</td>
            </tr>
            <tr>
              <th>X</th>
              <td>{(appLinks?.twitterScreenName && `@${appLinks?.twitterScreenName}`) || '(空欄)'}</td>
            </tr>
            <tr>
              <th>pixiv</th>
              <td>{(appLinks?.pixivUserId && `users/${appLinks?.pixivUserId}`) || '(空欄)'}</td>
            </tr>
            <tr>
              <th>Web</th>
              <td>{appLinks?.websiteURL || '(空欄)'}</td>
            </tr>
            <tr>
              <th>お品書きURL</th>
              <td>{appLinks?.menuURL || '(空欄)'}</td>
            </tr>
          </tbody>
        </table>
      </>
      <>
        <h3>頒布物情報</h3>
        <table>
          <tbody>
            <tr>
              <th>成人向け</th>
              <td>{app?.circle.hasAdult ? '有り' : '無し'}</td>
            </tr>
            <tr>
              <th>ジャンル</th>
              <td>{app && getGenre(app.circle.genre)?.name}</td>
            </tr>
            <tr>
              <th>概要</th>
              <td>{app?.overview.description}</td>
            </tr>
            <tr>
              <th>総搬入量</th>
              <td>{app?.overview.totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </>
      <>
        <h3>隣接配置希望</h3>
        <table>
          <tbody>
            <tr>
              <th>合体先</th>
              <td>{app?.unionCircleId || '(空欄)'}</td>
            </tr>
            <tr>
              <th>プチオンリー</th>
              <td>{app?.petitCode || '(空欄)'}</td>
            </tr>
          </tbody>
        </table>
      </>
      <>
        <h3>通信欄</h3>
        <p>
          {app?.remarks || '(空欄)'}
        </p>
      </>
      <>
        <h3>申し込み責任者情報</h3>
        <table>
          <tbody>
            <tr>
              <th>氏名</th>
              <td>{userData?.name}</td>
            </tr>
            <tr>
              <th>アドレス</th>
              <td>{userData?.email}</td>
            </tr>
          </tbody>
        </table>
      </>
    </TwoColumnLayout>

    <h2>操作</h2>
  </MainLayout>
}

export default ApplicationDetailPage

const CircleCutImage = styled.img`
  width: 100%;
`
