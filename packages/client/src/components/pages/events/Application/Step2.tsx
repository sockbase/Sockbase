import { useEffect } from 'react'
import type { SockbaseCircleApplication } from 'sockbase'

import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'
import FormButton from '../../../Form/Button'

interface Props {
  app: SockbaseCircleApplication | undefined
  prevStep: () => void
  nextStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  useEffect(() => console.log(props.app), [props.app])

  return (
    <>
      {
        props.app && <>
          <h1>入力内容確認</h1>

          <h2>申し込むスペース数</h2>
          <table>
            <tbody>
              <tr>
                <th>スペース</th>
                <td>1スペース</td>
              </tr>
              <tr>
                <th>詳細</th>
                <td>机半分, 椅子1脚, 通行証1枚</td>
              </tr>
              <tr>
                <th>参加費</th>
                <td>4,500円</td>
              </tr>
            </tbody>
          </table>

          <h2>サークルカット</h2>

          <h2>サークル情報</h2>
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

          <h2>頒布物情報</h2>
          <table>
            <tbody>
              <tr>
                <th>成人向け頒布物の有無</th>
                <td>{props.app.circle.hasAdult
                  ? '成人向け頒布物があります'
                  : '成人向け頒布物はありません'}</td>
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

          <h2>隣接配置希望(合体)情報</h2>
          <table>
            <tbody>
              <tr>
                <th>合体希望サークル 合体申込みID</th>
                <td>{props.app.unionCircleId}</td>
              </tr>
              <tr>
                <th>プチオンリーコード</th>
                <td>{props.app.petitCode}</td>
              </tr>
            </tbody>
          </table>

          <h2>申し込み責任者情報</h2>
          <table>
            <tbody>
              <tr>
                <th>氏名</th>
                <td>{props.app.leader.name}</td>
              </tr>
              <tr>
                <th>生年月日</th>
                <td>{new Date(props.app.leader.birthday).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>郵便番号</th>
                <td>{props.app.leader.postalCode}</td>
              </tr>
              <tr>
                <th>住所</th>
                <td>{props.app.leader.address}</td>
              </tr>
              <tr>
                <th>電話番号</th>
                <td>{props.app.leader.telephone}</td>
              </tr>
            </tbody>
          </table>

          <h2>通信欄</h2>
          <p>
            {props.app.remarks || '(空欄)'}
          </p>

          <h1>申し込み情報送信</h1>
          <p>
            上記の内容で正しければ「決済に進む(申込み情報送信)」ボタンを押してください。
          </p>
          <p>
            修正する場合は、「修正」ボタンを押してください。
          </p>

          <FormSection>
            <FormItem>
              <FormButton color="default"
                onClick={() => props.prevStep()}>
                修正する
              </FormButton>
            </FormItem>
            <FormItem>
              <FormButton
                onClick={() => props.nextStep()}>
                決済に進む(申込み情報送信)
              </FormButton>
            </FormItem>
          </FormSection>
        </>
      }
    </>
  )
}

export default Step2
