
import { useEffect, useState } from 'react'
import type { SockbaseEventSpace, SockbaseCircleApplication } from 'sockbase'

import FormSection from '../../../Form/FormSection'
import FormLabel from '../../../Form/Label'
import FormRadio from '../../../Form/Radio'
import FormItem from '../../../Form/FormItem'
import FormInput from '../../../Form/Input'
import FormHelp from '../../../Form/Help'
import FormSelect from '../../../Form/Select'
import Alert from '../../../Parts/Alert'
import FormButton from '../../../Form/Button'
import FormCheckbox from '../../../Form/Checkbox'
import FormTextarea from '../../../Form/Textarea'

const paymentMethods: Array<{
  text: string
  value: string
}> =
  [
    {
      text: 'クレジットカード決済(推奨)',
      value: 'online'
    },
    {
      text: '銀行振込',
      value: 'bankTransfer'
    }
  ]

interface Props {
  spaces: SockbaseEventSpace[]
  nextStep: () => void
  isLoggedIn: boolean
}
const Step1: React.FC<Props> = (props) => {
  const [app, setApp] = useState<SockbaseCircleApplication>({
    spaceId: '',
    circle: {
      name: '',
      yomi: '',
      penName: '',
      penNameYomi: '',
      hasAdult: null,
      genre: ''
    },
    overview: {
      description: '',
      totalAmount: ''
    },
    unionCircleId: '',
    petitCode: '',
    leader: {
      name: '',
      birthday: '1990-01-01',
      postalCode: '',
      address: '',
      telephone: '',
      email: '',
      password: '',
      rePassword: ''
    },
    paymentMethod: '',
    remarks: ''
  })
  const [isAgreed, setAgreed] = useState(false)

  const [spaceInfo, setSpaceInfo] = useState<SockbaseEventSpace | undefined>()
  const onChangeSpaceSelect: () => void =
    () => {
      const space = props.spaces
        .filter(i => i.id === app.spaceId)[0]
      setSpaceInfo(space)
    }
  useEffect(onChangeSpaceSelect, [app.spaceId])

  return (
    <>
      <h2>申込むスペース数</h2>
      <FormSection>
        <FormItem>
          <FormLabel>スペース数</FormLabel>
          <FormRadio
            name="space"
            values={
              props.spaces.map(i => ({
                text: `${i.name} ${i.price.toLocaleString()}円 / ${i.description}`,
                value: i.id
              }))
            }
            onChange={(spaceId) => setApp(s => ({ ...s, spaceId }))}
            value={app.spaceId} />
        </FormItem>
      </FormSection>

      <h2>サークル情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>サークル名</FormLabel>
          <FormInput
            value={app.circle.name}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, name: e.target.value } }))} />
        </FormItem>

        <FormItem>
          <FormLabel>サークル名(よみ)</FormLabel>
          <FormInput
            value={app.circle.yomi}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, yomi: e.target.value } }))} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム</FormLabel>
          <FormInput
            value={app.circle.penName}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penName: e.target.value } }))} />
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム(よみ)</FormLabel>
          <FormInput
            value={app.circle.penNameYomi}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penNameYomi: e.target.value } }))} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>
      </FormSection>

      <h2>頒布物情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>成人向け頒布物の有無</FormLabel>
          <FormSelect
            value={app.circle.hasAdult === null
              ? 'none'
              : app.circle.hasAdult
                ? 'yes'
                : 'no'}
            onChange={e => setApp(s => ({
              ...s,
              circle: {
                ...s.circle,
                hasAdult: e.target.value === 'none'
                  ? null
                  : e.target.value === 'yes'
              }
            }))}>
            <option value="none">選択してください</option>
            <option value="yes">成人向け頒布物はありません</option>
            <option value="no">成人向け頒布物があります</option>
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormLabel>頒布物のジャンル</FormLabel>
          <FormSelect
            value={app.circle.genre}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, genre: e.target.value } }))}>
            <option>選択してください</option>
            <option>あいうえお</option>
            <option>あいうえお</option>
            <option>あいうえお</option>
            <option>あいうえお</option>
            <option>あいうえお</option>
          </FormSelect>
          <FormHelp>
            頒布する作品が複数ある場合、大半を占めるジャンルを選択してください。
          </FormHelp>
        </FormItem >
        <FormItem>
          <FormLabel>頒布物概要</FormLabel>
          <FormTextarea
            value={app.overview.description}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, description: e.target.value } }))} />
          <FormHelp>
            スペース配置の参考にしますので、キャラクター名等は正しく入力してください。<br />
            また、合同誌企画やイベント外との連動企画がある場合はその旨も入力してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>総搬入量</FormLabel>
          <FormInput
            value={app.overview.totalAmount}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, totalAmount: e.target.value } }))} />
        </FormItem>
      </FormSection >

      <h2>隣接配置希望(合体)情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>合体希望サークル 合体申込みID</FormLabel>
          <FormInput
            value={app.unionCircleId}
            onChange={e => setApp(s => ({ ...s, unionCircleId: e.target.value }))} />
          <FormHelp>先に申し込んだ方から提供された合体申込みIDを入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>プチオンリーコード</FormLabel>
          <FormInput
            value={app.petitCode}
            onChange={e => setApp(s => ({ ...s, petitCode: e.target.value }))} />
          <FormHelp>プチオンリー主催から入力を指示された場合のみ入力してください。</FormHelp>
        </FormItem>
      </FormSection>

      <h2>申込み責任者情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>氏名</FormLabel>
          <FormInput
            value={app.leader.name}
            onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, name: e.target.value } }))} />
        </FormItem>
        <FormItem>
          <FormLabel>生年月日</FormLabel>
          <FormInput type="date"
            value={app.leader.birthday}
            onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, birthday: e.target.value } }))} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>郵便番号</FormLabel>
          <FormInput
            value={app.leader.postalCode}
            onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, postalCode: e.target.value } }))} />
          <FormHelp>
            ハイフンは自動で入力されます
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>住所</FormLabel>
          <FormInput
            value={app.leader.address}
            onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, address: e.target.value } }))} />
        </FormItem>
        <FormItem>
          <FormLabel>電話番号</FormLabel>
          <FormInput
            value={app.leader.telephone}
            onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, telephone: e.target.value } }))} />
        </FormItem>
      </FormSection>

      {!props.isLoggedIn
        ? <>
          <h2>Sockbaseログイン情報</h2>
          <p>
            申込み情報の確認等に使用するアカウントを作成します。
          </p>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput type="email"
                value={app.leader.email}
                onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, email: e.target.value } }))} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormInput type="password"
                value={app.leader.password}
                onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, password: e.target.value } }))} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード(確認)</FormLabel>
              <FormInput type="password"
                value={app.leader.rePassword}
                onChange={e => setApp(s => ({ ...s, leader: { ...s.leader, rePassword: e.target.value } }))} />
            </FormItem>
          </FormSection>
        </>
        : <></>}

      <h2>サークル参加費お支払い方法</h2>
      {
        spaceInfo
          ? <FormSection>
            <FormItem>
              <table>
                <tbody>
                  <tr>
                    <th>申込むスペース</th>
                    <td>{spaceInfo.name}</td>
                  </tr>
                  <tr>
                    <th>スペース詳細情報</th>
                    <td>{spaceInfo.description}</td>
                  </tr>
                  <tr>
                    <th>お支払い額</th>
                    <td>{spaceInfo.price.toLocaleString()}円</td>
                  </tr>
                </tbody>
              </table>
            </FormItem>
            <FormItem>
              <FormRadio
                name="paymentMethod"
                values={paymentMethods}
                value={app.paymentMethod}
                onChange={paymentMethod => setApp(s => ({ ...s, paymentMethod }))} />
            </FormItem>
            {app.paymentMethod === 'bankTransfer' && <FormItem>
              <Alert>
                銀行振込の場合、申込み完了までお時間をいただくことがございます。
              </Alert>
            </FormItem>}
          </FormSection>
          : <Alert>申込みたいスペース数を選択してください</Alert>
      }

      <h2>通信欄</h2>
      <p>申込みにあたり運営チームへの要望等がありましたら入力してください。</p>
      <FormSection>
        <FormItem>
          <FormTextarea
            value={app.remarks}
            onChange={e => setApp(s => ({ ...s, remarks: e.target.value }))}
          ></FormTextarea>
        </FormItem>
      </FormSection >
      <h2>注意事項</h2>
      <p>
        Sockbase利用規約およびプライバシーポリシーに同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAggreed"
            label="同意します"
            onChange={(agreement) => setAgreed(agreement)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>
      <FormButton
        disabled={!isAgreed}
        onClick={() => props.nextStep()}>
        入力内容確認画面へ進む
      </FormButton>
    </>
  )
}

export default Step1
