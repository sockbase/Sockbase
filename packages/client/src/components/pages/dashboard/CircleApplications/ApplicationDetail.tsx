import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseApplicationStatus, SockbaseEvent } from 'sockbase'
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

interface Props {
  app: SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }
  event: SockbaseEvent
  userData: SockbaseAccount
  circleCutURL: string
  isAdmin: boolean
  handleChangeStatus: (status: SockbaseApplicationStatus) => void
}
const ApplicationDetail: React.FC<Props> = (props) => {
  const spaceName = useMemo(() => {
    const spaceData = props.event.spaces.filter(i => i.id === props.app.spaceId)[0]
    return spaceData.name
  }, [])

  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{props.event._organization.name}</li>
        <li><Link to="/dashboard/events/sockbase1">{props.event.eventName}</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEdit />}
        title={props.app.circle.name}
        description="申し込み情報" />

      <TwoColumnsLayout>
        <>
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
                <td>{new Date(props.app.timestamp).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込みステータス</th>
                <td>{sockbaseShared.constants.application.statusText[props.app.meta.applicationStatus]}</td>
              </tr>
              <tr>
                <th>決済</th>
                <td>- TBD -</td>
              </tr>
              <tr>
                <th>通行証発券</th>
                <td>- TBD -</td>
              </tr>
            </tbody>
          </table>

          <h3>スペース</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込んだスペース</th>
                <td>{spaceName}</td>
              </tr>
              <tr>
                <th>スペース配置</th>
                <td>- TBD -</td>
              </tr>
            </tbody>
          </table>

          <h3>サークルカット</h3>
          <p>
            提出されました
          </p>
          {props.circleCutURL && <CircleCutImage src={props.circleCutURL} />}

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
                <td>{props.app.circle.genre}</td>
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
        </>

        <>
          <h3>頒布物情報デジタル提出</h3>
          <p>
            入力されていません
          </p>
          <FormSection>
            <FormItem>
              <FormButton>頒布物情報の編集</FormButton>
            </FormItem>
          </FormSection>

          <h3>サークル広報情報</h3>
          <table>
            <tbody>
              <tr>
                <th>Twitter</th>
                <td>- TBD -</td>
              </tr>
              <tr>
                <th>pixiv</th>
                <td>- TBD -</td>
              </tr>
              <tr>
                <th>Web</th>
                <td>- TBD -</td>
              </tr>
              <tr>
                <th>お品書きURL</th>
                <td>- TBD -</td>
              </tr>
            </tbody>
          </table>
          <FormSection>
            <FormItem>
              <FormButton color="default">サークル広報情報を編集</FormButton>
            </FormItem>
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