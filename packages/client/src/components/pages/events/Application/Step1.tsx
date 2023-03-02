
import { useEffect, useState } from 'react'

import type { SockbaseEventSpace, SockbaseApplication, SockbaseAccountSecure } from 'sockbase'
import { type IPaymentMethod } from './StepContainer'

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
import useValidate from '../../../../hooks/useValidate'

interface Props {
  app: SockbaseApplication | undefined
  leader: SockbaseAccountSecure | undefined
  spaces: SockbaseEventSpace[]
  paymentMethods: IPaymentMethod[]
  prevStep: () => void
  nextStep: (app: SockbaseApplication, leader: SockbaseAccountSecure) => void
  isLoggedIn: boolean
}
const Step1: React.FC<Props> = (props) => {
  const validator = useValidate()

  const [app, setApp] = useState<SockbaseApplication>({
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
    paymentMethod: '',
    remarks: ''
  })
  const [leader, setLeader] = useState({
    name: '',
    birthday: '1990-01-01',
    postalCode: '',
    address: '',
    telephone: '',
    email: '',
    password: '',
    rePassword: ''
  })
  const [isAgreed, setAgreed] = useState(false)

  const [spaceIds, setSpaceIds] = useState<string[]>()
  const [paymentMethodIds, setPaymentMethodIds] = useState<string[]>()
  const [isAllValid, setAllValid] = useState(false)
  const [invalidFieldCount, setInvalidFieldCount] = useState(0)

  const [error, setError] = useState<string | undefined>()

  const onInitialize: () => void =
    () => {
      if (props.app) {
        setApp(props.app)
      }
      if (props.leader) {
        setLeader(props.leader)
      }
      if (props.spaces) {
        setSpaceIds(props.spaces.map(i => i.id))
      }
      if (props.paymentMethods) {
        setPaymentMethodIds(props.paymentMethods.map(i => i.id))
      }
    }
  useEffect(onInitialize, [props.app, props.leader, props.spaces, props.paymentMethods])

  const [spaceInfo, setSpaceInfo] = useState<SockbaseEventSpace | undefined>()
  const onChangeSpaceSelect: () => void =
    () => {
      const space = props.spaces
        .filter(i => i.id === app.spaceId)[0]
      setSpaceInfo(space)
    }
  useEffect(onChangeSpaceSelect, [app.spaceId])

  const onChangeForm: () => void =
    () => {
      if (!spaceIds || !paymentMethodIds) return

      const validators = [
        validator.isIn(app.spaceId, spaceIds),
        !validator.isEmpty(app.circle.name),
        validator.isOnlyHiragana(app.circle.yomi),
        !validator.isEmpty(app.circle.penName),
        validator.isOnlyHiragana(app.circle.penNameYomi),
        !validator.isNull(app.circle.hasAdult),
        validator.isIn(app.circle.genre, ['あいうえお']),
        !validator.isEmpty(app.overview.description),
        !validator.isEmpty(app.overview.totalAmount),
        validator.isIn(app.paymentMethod, paymentMethodIds)
      ]
      const invalidCount = validators
        .filter(i => !i)
        .length
      const hasValidationError = validators
        .reduce((p, c) => p.add(c), new Set<boolean>())
        .has(false)

      if (!props.isLoggedIn) {
        const accountValidators = [
          !validator.isEmpty(leader.name),
          validator.isDate(leader.birthday),
          validator.isPostalCode(leader.postalCode),
          validator.isEmail(leader.email),
          !validator.isEmpty(leader.password),
          !validator.isEmpty(leader.rePassword),
          validator.equals(leader.password, leader.rePassword)
        ]
        const accountInvalidFieldCount = accountValidators
          .filter(i => !i)
          .length
        const hasAccountValidationError = accountValidators
          .reduce((p, c) => p.add(c), new Set<boolean>())
          .has(false)

        setInvalidFieldCount(invalidCount + accountInvalidFieldCount)
        setAllValid(!hasValidationError && !hasAccountValidationError)
        return
      }

      setInvalidFieldCount(invalidCount)
      setAllValid(!hasValidationError)
    }
  useEffect(onChangeForm, [spaceIds, app, leader])

  const handleSubmit: () => void =
    () => {
      setError(undefined)

      if (!isAllValid) {
        setError('入力内容に不備があります')
        return
      }

      props.nextStep(app, leader)
    }

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={() => props.prevStep()}>申し込み説明画面へ戻る</FormButton>
        </FormItem>
      </FormSection>
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

      <h2>サークルカット</h2>
      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput type="file" />
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
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, yomi: e.target.value } }))}
            isError={!validator.isEmpty(app.circle.yomi) && !validator.isOnlyHiragana(app.circle.yomi)} />
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
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penNameYomi: e.target.value } }))}
            isError={!validator.isEmpty(app.circle.penNameYomi) && !validator.isOnlyHiragana(app.circle.penNameYomi)} />
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
            合同誌企画やイベント外との連動企画がある場合はその旨も入力してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>総搬入量</FormLabel>
          <FormInput
            value={app.overview.totalAmount}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, totalAmount: e.target.value } }))} />
          <FormHelp>単位まで入力してください。</FormHelp>
        </FormItem>
      </FormSection >

      <h2>隣接配置希望(合体)情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>合体希望サークル 合体申し込みID</FormLabel>
          <FormInput
            value={app.unionCircleId}
            onChange={e => setApp(s => ({ ...s, unionCircleId: e.target.value }))} />
          <FormHelp>先に申し込んだ方から提供された合体申し込みIDを入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>プチオンリーコード</FormLabel>
          <FormInput
            value={app.petitCode}
            onChange={e => setApp(s => ({ ...s, petitCode: e.target.value }))} />
          <FormHelp>プチオンリー主催から入力を指示された場合のみ入力してください。</FormHelp>
        </FormItem>
      </FormSection>

      {!props.isLoggedIn
        ? <>
          <h2>申し込み責任者情報</h2>
          <FormSection>
            <FormItem>
              <FormLabel>氏名</FormLabel>
              <FormInput
                value={leader.name}
                onChange={e => setLeader(s => ({ ...s, name: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>生年月日</FormLabel>
              <FormInput type="date"
                value={leader.birthday}
                onChange={e => setLeader(s => ({ ...s, birthday: e.target.value }))} />
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormLabel>郵便番号</FormLabel>
              <FormInput
                value={leader.postalCode}
                onChange={e => {
                  if (e.target.value.length > 8) return
                  const postal = e.target.value.match(/(\d{3})(\d{4})/)
                  setLeader(s => ({
                    ...s,
                    postalCode:
                      postal?.length === 3
                        ? `${postal[1]}-${postal[2]}`
                        : e.target.value
                  }))
                }}
                isError={!validator.isEmpty(leader.postalCode) && !validator.isPostalCode(leader.postalCode)} />
              <FormHelp>
                ハイフンは自動で入力されます
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormInput
                value={leader.address}
                onChange={e => setLeader(s => ({ ...s, address: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput
                value={leader.telephone}
                onChange={e => setLeader(s => ({ ...s, telephone: e.target.value }))} />
            </FormItem>
          </FormSection>

          <h2>Sockbaseログイン情報</h2>
          <p>
            申し込み情報の確認等に使用するアカウントを作成します。
          </p>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput type="email"
                value={leader.email}
                onChange={e => setLeader(s => ({ ...s, email: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormInput type="password"
                value={leader.password}
                onChange={e => setLeader(s => ({ ...s, password: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード(確認)</FormLabel>
              <FormInput type="password"
                value={leader.rePassword}
                onChange={e => setLeader(s => ({ ...s, rePassword: e.target.value }))}
                isError={!validator.isEmpty(leader.rePassword) && leader.password !== leader.rePassword} />
              {!validator.isEmpty(leader.rePassword) && leader.password !== leader.rePassword &&
                <FormHelp>パスワードの入力が間違っています</FormHelp>}
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
                values={props.paymentMethods.map(i => ({
                  text: i.description,
                  value: i.id
                }))}
                value={app.paymentMethod}
                onChange={paymentMethod => setApp(s => ({ ...s, paymentMethod }))} />
            </FormItem>
            {app.paymentMethod === 'bankTransfer' && <FormItem>
              <Alert>
                銀行振込の場合、申し込み完了までお時間をいただくことがございます。
              </Alert>
            </FormItem>}
          </FormSection>
          : <Alert>申し込みたいスペース数を選択してください</Alert>
      }

      <h2>通信欄</h2>
      <p>申し込みにあたり運営チームへの要望等がありましたら入力してください。</p>
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
      <FormSection>
        {error && <FormItem>
          <Alert type="danger">{error}</Alert>
        </FormItem>}
        {invalidFieldCount > 0 && <FormItem>
          <Alert type="danger">
            {invalidFieldCount}個の入力項目に不備があります。
          </Alert>
        </FormItem>}
        {error && <Alert type="danger">{error}</Alert>}
        <FormButton
          disabled={!isAgreed || !isAllValid}
          onClick={handleSubmit}>
          入力内容確認画面へ進む
        </FormButton>
      </FormSection>
    </>
  )
}

export default Step1
