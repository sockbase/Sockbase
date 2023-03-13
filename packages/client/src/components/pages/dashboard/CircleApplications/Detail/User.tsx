import { Link } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'
import { MdEdit } from 'react-icons/md'

import PageTitle from '../../../../Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../../../Layout/TwoColumns/TwoColumns'
import FormSection from '../../../../Form/FormSection'
import FormItem from '../../../../Form/FormItem'
import FormButton from '../../../../Form/Button'
import Alert from '../../../../Parts/Alert'
import CopyToClipboard from '../../../../Parts/CopyToClipboard'
import Breadcrumbs from '../../../../Parts/Breadcrumbs'

interface Props {
  spaceName: string
  app: SockbaseApplicationDocument
  event: SockbaseEvent
  userData: SockbaseAccount
  circleCutURL: string
}
const UserDetail: React.FC<Props> = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/applications">サークル参加申し込み履歴</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEdit />}
        title={props.app.circle.name}
        description="申し込み情報" />

      <TwoColumnsLayout>
        <>
          <h3>申し込み情報</h3>
          <Alert>
            隣接配置(合体)を希望される場合は下に表示されている「申し込みID」を後に申し込まれる方へお伝えください。
          </Alert>
          <table>
            <tbody>
              <tr>
                <th>申し込みID</th>
                <td>{props.app.hashId} {props.app.hashId && <CopyToClipboard content={props.app.hashId} />}</td>
              </tr>
              <tr>
                <th>申し込み日時</th>
                <td>{new Date(props.app.timestamp).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <h3>サークルカット</h3>
          <p>
            提出されました
          </p>

          <h3>スペース</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込んだスペース</th>
                <td>{props.spaceName}</td>
              </tr>
              <tr>
                <th>スペース配置</th>
                <td>- TBD -</td>
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
        </>
      </TwoColumnsLayout>
    </>
  )
}

export default UserDetail
