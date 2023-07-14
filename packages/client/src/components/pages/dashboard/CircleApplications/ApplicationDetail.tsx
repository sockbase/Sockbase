import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseApplicationLinksDocument, SockbaseApplicationMeta, SockbaseApplicationStatus, SockbaseEvent, SockbasePaymentDocument } from 'sockbase'
import sockbaseShared from '@sockbase/shared'

import { MdEdit } from 'react-icons/md'

import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'
import TwoColumnsLayout from '../../../Layout/TwoColumns/TwoColumns'
import CopyToClipboard from '../../../Parts/CopyToClipboard'
import CircleCutImage from '../../../Parts/CircleCutImage'
import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'
import FormButton from '../../../Form/Button'
import PaymentStatusLabel from '../../../Parts/PaymentStatusLabel'
import Alert from '../../../Parts/Alert'
import LinkButton from '../../../Parts/LinkButton'
import useDayjs from '../../../../hooks/useDayjs'

interface Props {
  hashedAppId: string
  app: SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }
  event: SockbaseEvent
  eventId: string
  payment: SockbasePaymentDocument | null
  userData: SockbaseAccount
  links: SockbaseApplicationLinksDocument | null
  circleCutURL: string
  isAdmin: boolean | null
  handleChangeStatus: (status: SockbaseApplicationStatus) => void
}
const ApplicationDetail: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const spaceName = useMemo(() => {
    const spaceInfo = props.event.spaces.filter(s => s.id === props.app.spaceId)[0]
    return spaceInfo.name
  }, [])

  const genreName = useMemo(() => {
    const genreInfo = props.event.genres.filter(g => g.id === props.app.circle.genre)[0]
    return genreInfo.name
  }, [])

  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        {props.isAdmin
          ? <>
            <li><Link to="/dashboard/events">管理イベント</Link></li>
            <li>{props.event._organization.name}</li>
            <li><Link to={`/dashboard/events/${props.eventId}`}>{props.event.eventName}</Link></li>
          </>
          : <>
            <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
            <li>{props.event.eventName}</li>
          </>}
      </Breadcrumbs>
      <PageTitle
        icon={<MdEdit />}
        title={props.app.circle.name}
        description="申し込み情報" />

      {props.payment?.status === 0 && <Alert type='danger' title='サークル参加費のお支払いをお願いいたします'>
        申し込み手続きを円滑に行うため<Link to="/dashboard/payments">こちら</Link>からお支払いをお願いいたします。
      </Alert>}

      {!props.links && <Alert type="danger" title="広報情報を入力してください">
        広報情報は<Link to={`/dashboard/applications/${props.hashedAppId}/links`}>こちら</Link>から入力できます。<br />
        カタログ等に掲載する情報は「<b>{formatByDate(props.event.schedules.fixedApplication, 'YYYY年M月D日 H時mm分')}</b>」時点のものとさせていただきます。
      </Alert>}

      <TwoColumnsLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込んだスペース</th>
                <td>{spaceName}</td>
              </tr>
              <tr>
                <th>申し込み状況</th>
                <td>{sockbaseShared.constants.application.statusText[props.app.meta.applicationStatus]}</td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>
                  <Link to="/dashboard/payments">
                    {(props.payment?.status !== undefined && <PaymentStatusLabel status={props.payment.status} />) ?? '-'}
                  </Link>
                </td>
              </tr>
              {/* <tr>
                <th>通行証発券</th>
                <td>- TBD -</td>
              </tr> */}
              {/* <tr>
                <th>スペース配置</th>
                <td>- TBD -</td>
              </tr> */}
            </tbody>
          </table>

          <h3>サークルカット</h3>
          {props.circleCutURL && <CircleCutImage src={props.circleCutURL} />}
          <p>
            サークルカットの変更は「お問い合わせ」よりご依頼ください。
          </p>

          <h3>サークル情報</h3>
          <table>
            <tbody>
              <tr>
                <th>サークル名</th>
                <td>{props.app.circle.name}</td>
              </tr>
              <tr>
                <th>サークル名(よみ)</th>
                <td>{props.app.circle.yomi}</td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>{props.app.circle.penName}</td>
              </tr>
              <tr>
                <th>ペンネーム(よみ)</th>
                <td>{props.app.circle.penNameYomi}</td>
              </tr>
            </tbody>
          </table>

          <h3>頒布物情報</h3>
          <table>
            <tbody>
              <tr>
                <th>成人向け頒布物の有無</th>
                <td>{props.app.circle.hasAdult ? '成人向け頒布物があります' : '成人向け頒布物はありません'}</td>
              </tr>
              <tr>
                <th>頒布物のジャンル</th>
                <td>{genreName}</td>
              </tr>
              <tr>
                <th>頒布物概要</th>
                <td>{props.app.overview.description}</td>
              </tr>
              <tr>
                <th>総搬入量</th>
                <td>{props.app.overview.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <h3>隣接配置(合体)希望</h3>
          <table>
            <tbody>
              <tr>
                <th>合体希望サークル 合体申し込みID</th>
                <td>{props.app.unionCircleId || '(空欄)'}</td>
              </tr>
              <tr>
                <th>プチオンリーコード</th>
                <td>{props.app.petitCode || '(空欄)'}</td>
              </tr>
            </tbody>
          </table>

          <h3>申込み責任者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み責任者氏名</th>
                <td>{props.userData.name}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{props.userData.email}</td>
              </tr>
              <tr>
                <th>メールアドレス確認状態</th>
                <td>{props.userData.isEmailVerified ? '確認済み' : '未確認'}</td>
              </tr>
            </tbody>
          </table>

          <h3>申し込み情報</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込みID</th>
                <td>{props.app.hashId} {props.app.hashId && <CopyToClipboard content={props.app.hashId} />}
                </td>
              </tr>
              <tr>
                <th>申し込み日時</th>
                <td>{props.app.createdAt?.toLocaleString() ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        </>

        <>
          {/* <h3>頒布物情報デジタル提出</h3>
          <p>
            入力されていません
          </p>
          <FormSection>
            <FormItem>
              <FormButton>頒布物情報の編集</FormButton>
            </FormItem>
          </FormSection> */}

          <h3>サークル広報情報</h3>
          <table>
            <tbody>
              <tr>
                <th>Twitter</th>
                <td>{props.links?.twitterScreenName ? `@${props.links.twitterScreenName}` : '(未入力)'}</td>
              </tr>
              <tr>
                <th>pixiv</th>
                <td>{props.links?.pixivUserId ? `users/${props.links.pixivUserId}` : '(未入力)'}</td>
              </tr>
              <tr>
                <th>Web</th>
                <td>{props.links?.websiteURL || '(未入力)'}</td>
              </tr>
              <tr>
                <th>お品書きURL</th>
                <td>{props.links?.menuURL || '(未入力)'}</td>
              </tr>
            </tbody>
          </table>
          <FormSection>
            {!props.links
              ? <FormItem>
                <LinkButton to={`/dashboard/applications/${props.hashedAppId}/links`}>サークル広報情報を入力</LinkButton>
              </FormItem>
              : <FormItem>
                <LinkButton to={`/dashboard/applications/${props.hashedAppId}/links`} color="default">サークル広報情報を編集</LinkButton>
              </FormItem>}
          </FormSection>

          {props.isAdmin && <>
            <h3>操作</h3>
            <FormSection>
              {props.app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.provisional &&
                <FormItem>
                  <FormButton
                    color="default"
                    onClick={() => props.handleChangeStatus(sockbaseShared.enumerations.application.status.provisional)}>仮申し込み状態にする</FormButton>
                </FormItem>}
              {props.app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.confirmed &&
                <FormItem>
                  <FormButton
                    color="info"
                    onClick={() => props.handleChangeStatus(sockbaseShared.enumerations.application.status.confirmed)}>申し込み確定状態にする</FormButton>
                </FormItem>}
              {props.app.meta.applicationStatus !== sockbaseShared.enumerations.application.status.canceled &&
                <FormItem>
                  <FormButton
                    color="danger"
                    onClick={() => props.handleChangeStatus(sockbaseShared.enumerations.application.status.canceled)}>キャンセル状態にする</FormButton>
                </FormItem>}
            </FormSection>
          </>}
        </>
      </TwoColumnsLayout>
    </>
  )
}

export default ApplicationDetail
