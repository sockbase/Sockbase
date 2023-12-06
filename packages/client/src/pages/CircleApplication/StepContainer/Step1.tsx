
import { useEffect, useState } from 'react'

import type { SockbaseEventSpace, SockbaseApplication, SockbaseAccountSecure, SockbaseEvent } from 'sockbase'
import sockbaseShared from 'shared'

import usePostalCode from '../../../hooks/usePostalCode'
import useValidate from '../../../hooks/useValidate'
import useFile from '../../../hooks/useFile'

import FormSection from '../../../components/Form/FormSection'
import FormLabel from '../../../components/Form/Label'
import FormRadio from '../../../components/Form/Radio'
import FormItem from '../../../components/Form/FormItem'
import FormInput from '../../../components/Form/Input'
import FormHelp from '../../../components/Form/Help'
import FormSelect from '../../../components/Form/Select'
import Alert from '../../../components/Parts/Alert'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormTextarea from '../../../components/Form/Textarea'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import useDayjs from '../../../hooks/useDayjs'

interface Props {
  eventId: string
  event: SockbaseEvent
  app: SockbaseApplication | undefined
  leaderUserData: SockbaseAccountSecure | undefined
  circleCutFile: File | null | undefined
  prevStep: () => void
  nextStep: (app: SockbaseApplication, leaderUserData: SockbaseAccountSecure, circleCutData: string, circleCutFile: File) => void
  isLoggedIn: boolean
}
const Step1: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { getAddressByPostalCode } = usePostalCode()
  const {
    data: circleCutDataWithHook,
    openAsDataURL: openCircleCut
  } = useFile()
  const { formatByDate } = useDayjs()

  const [circleCutFile, setCircleCutFile] = useState<File | null>()
  const [circleCutData, setCircleCutData] = useState<string>()

  const [app, setApp] = useState<SockbaseApplication>({
    eventId: props.eventId,
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
  const [leaderUserData, setLeaderUserData] = useState({
    name: '',
    birthday: 0,
    postalCode: '',
    address: '',
    telephone: '',
    email: '',
    password: '',
    rePassword: ''
  })
  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')

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
      if (props.leaderUserData) {
        setLeaderUserData(props.leaderUserData)
        setDisplayBirthday(s => formatByDate(props.leaderUserData?.birthday, 'YYYY-MM-DD'))
      }
      if (props.circleCutFile) {
        setCircleCutFile(props.circleCutFile)
      }
      if (props.event.spaces) {
        setSpaceIds(props.event.spaces.map(i => i.id))
      }

      setPaymentMethodIds(sockbaseShared.constants.payment.methods.map(i => i.id))
    }
  useEffect(onInitialize, [props.app, props.leaderUserData, props.circleCutFile, props.event])

  const onChangeCircleCutFile: () => void =
    () => {
      if (!circleCutFile) return
      openCircleCut(circleCutFile)
    }
  useEffect(onChangeCircleCutFile, [circleCutFile])

  const [selectedSpace, setSelectedSpace] = useState<SockbaseEventSpace | undefined>()
  const onChangeSpaceSelect: () => void =
    () => setSelectedSpace(props.event.spaces.filter(i => i.id === app.spaceId)[0])
  useEffect(onChangeSpaceSelect, [app.spaceId])

  const onChangeForm: () => void =
    () => {
      if (!spaceIds || !paymentMethodIds || !circleCutData) return

      const validators = [
        validator.isIn(app.spaceId, spaceIds),
        !validator.isNull(circleCutFile),
        !validator.isEmpty(circleCutData),
        !validator.isEmpty(app.circle.name),
        validator.isOnlyHiragana(app.circle.yomi),
        !validator.isEmpty(app.circle.penName),
        validator.isOnlyHiragana(app.circle.penNameYomi),
        !props.event.permissions.allowAdult || !validator.isNull(app.circle.hasAdult),
        validator.isIn(app.circle.genre, props.event.genres.map(g => g.id)),
        !validator.isEmpty(app.overview.description),
        !validator.isEmpty(app.overview.totalAmount),
        validator.isIn(app.paymentMethod, paymentMethodIds),
        (!app.unionCircleId || validator.isApplicationHashId(app.unionCircleId))
      ]
      const invalidCount = validators
        .filter(i => !i)
        .length
      const hasValidationError = validators
        .reduce((p, c) => p.add(c), new Set<boolean>())
        .has(false)

      if (!props.isLoggedIn) {
        const accountValidators = [
          !validator.isEmpty(leaderUserData.name),
          // validator.isDate(leaderUserData.birthday),
          validator.isPostalCode(leaderUserData.postalCode),
          validator.isEmail(leaderUserData.email),
          validator.isStrongPassword(leaderUserData.password),
          !validator.isEmpty(leaderUserData.rePassword),
          validator.equals(leaderUserData.password, leaderUserData.rePassword)
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
  useEffect(onChangeForm, [spaceIds, app, leaderUserData, circleCutFile, circleCutData, props.event])

  const onChangeBirthday: () => void =
    () => setLeaderUserData(s => ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  useEffect(onChangeBirthday, [displayBirthday])

  const onChangeCircleCutData: () => void =
    () => {
      if (!circleCutDataWithHook) return
      setCircleCutData(circleCutDataWithHook)
    }
  useEffect(onChangeCircleCutData, [circleCutDataWithHook])

  const setTestData: () => void =
    () => {
      setApp({
        eventId: props.eventId,
        spaceId: props.event.spaces[0].id,
        circle: {
          name: 'test',
          yomi: 'てすと',
          penName: 'nirsmmy',
          penNameYomi: 'そめみやねいろ',
          hasAdult: false,
          genre: 'aiueo1'
        },
        overview: {
          description: 'ここには頒布物概要が入ります',
          totalAmount: '123冊'
        },
        unionCircleId: '',
        petitCode: '',
        paymentMethod: 'online',
        remarks: '備考'
      })
      setLeaderUserData({
        name: '染宮ねいろ',
        birthday: new Date('2002/03/29').getTime(),
        postalCode: '133-0065',
        address: '住所',
        telephone: '08081656154',
        email: 'nirsmmy@gmail.com',
        password: 'password1234',
        rePassword: 'password1234'
      })
      setDisplayBirthday('2002-03-29')
      setAgreed(true)
    }

  const handleSubmit: () => void =
    () => {
      setError(undefined)
      if (!isAllValid || !circleCutData || !circleCutFile) {
        setError('入力内容に不備があります')
        return
      }

      props.nextStep(app, leaderUserData, circleCutData, circleCutFile)
    }

  const handleFilledPostalCode: (postalCode: string) => void =
    (postalCode) => {
      const sanitizedPostalCode = postalCode.replaceAll('-', '')

      if (sanitizedPostalCode.length !== 7) return
      getAddressByPostalCode(sanitizedPostalCode)
        .then(address => setLeaderUserData(s => ({
          ...s,
          address
        })))
        .catch(err => {
          throw err
        })
    }

  return (
    <>
      {import.meta.env.DEV &&
        <FormSection>
          <FormItem>
            <FormButton onClick={setTestData} color="info">テストデータ入力(開発用)</FormButton>
          </FormItem>
        </FormSection>
      }

      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={props.prevStep}>申し込み説明画面へ戻る</FormButton>
        </FormItem>
      </FormSection>

      <h2>申込むスペース数</h2>
      <FormSection>
        <FormItem>
          <FormLabel>スペース数</FormLabel>
          <FormRadio
            name="space"
            values={
              props.event.spaces.map(i => ({
                text: `${i.name} ${i.price.toLocaleString()}円 / ${i.description}`,
                value: i.id
              }))
            }
            onChange={(spaceId) => setApp(s => ({ ...s, spaceId }))}
            value={app.spaceId} />
        </FormItem>
      </FormSection>

      <h2>サークルカット</h2>
      <ul>
        <li>サークルカットを提出する際は、テンプレートを使用する必要があります。</li>
        <li>サークルカットの変更は、申し込み後のマイページから行えます。</li>
        <li>公序良俗に反する画像は使用できません。不特定多数の方の閲覧が可能なためご配慮をお願いいたします。</li>
      </ul>
      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput
            type="file"
            accept="image/*"
            onChange={e => setCircleCutFile(e.target.files?.[0])} />
        </FormItem>
        <FormItem>
          {circleCutData && <CircleCutImage src={circleCutData} />}
        </FormItem>
      </FormSection>

      <h2>サークル情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>サークル名</FormLabel>
          <FormInput
            placeholder='サークル名'
            value={app.circle.name}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, name: e.target.value } }))} />
        </FormItem>

        <FormItem>
          <FormLabel>サークル名(よみ)</FormLabel>
          <FormInput
            placeholder='さーくるめい'
            value={app.circle.yomi}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, yomi: e.target.value } }))}
            hasError={!validator.isEmpty(app.circle.yomi) && !validator.isOnlyHiragana(app.circle.yomi)} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム</FormLabel>
          <FormInput
            placeholder='ペンネーム'
            value={app.circle.penName}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penName: e.target.value } }))} />
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム(よみ)</FormLabel>
          <FormInput
            placeholder='ぺんねーむ'
            value={app.circle.penNameYomi}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penNameYomi: e.target.value } }))}
            hasError={!validator.isEmpty(app.circle.penNameYomi) && !validator.isOnlyHiragana(app.circle.penNameYomi)} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>
      </FormSection>

      <h2>頒布物情報</h2>
      <FormSection>
        {
          props.event.permissions.allowAdult &&
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
              <option value="no">成人向け頒布物はありません</option>
              <option value="yes">成人向け頒布物があります</option>
            </FormSelect>
          </FormItem>
        }
        <FormItem>
          <FormLabel>頒布物のジャンル</FormLabel>
          <FormSelect
            value={app.circle.genre}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, genre: e.target.value } }))}>
            <option value="">選択してください</option>
            {props.event.genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </FormSelect>
          <FormHelp>
            頒布する作品が複数ある場合、大半を占めるジャンルを選択してください。
          </FormHelp>
        </FormItem >
        <FormItem>
          <FormLabel>頒布物概要</FormLabel>
          <FormTextarea
            placeholder='◯◯◯◯と△△△△のシリアス系合同誌(小説, 漫画)を頒布する予定。その他グッズや既刊あり。'
            value={app.overview.description}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, description: e.target.value } }))} />
          <FormHelp>
            スペース配置の参考にしますので、キャラクター名等は正しく入力してください。<br />
            合同誌企画やイベント外との連動企画がある場合はその旨も入力してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>総搬入量</FormLabel>
          <FormTextarea
            placeholder='合同誌: 1種1,000冊, 既刊: 5種合計500冊, グッズ: 3種合計30個'
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
            placeholder='20231231235959123-abc0def1'
            value={app.unionCircleId}
            onChange={e => setApp(s => ({ ...s, unionCircleId: e.target.value }))}
            hasError={!validator.isEmpty(app.unionCircleId) && !validator.isApplicationHashId(app.unionCircleId)} />
          <FormHelp>先に申し込んだ方から提供された合体申し込みIDを入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>プチオンリーコード</FormLabel>
          <FormInput
            placeholder='marukaku00'
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
                placeholder='速部 すみれ'
                value={leaderUserData.name}
                onChange={e => setLeaderUserData(s => ({ ...s, name: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>生年月日</FormLabel>
              <FormInput type="date"
                value={displayBirthday}
                onChange={e => setDisplayBirthday(e.target.value)} />
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormLabel>郵便番号</FormLabel>
              <FormInput
                placeholder='0000000'
                value={leaderUserData.postalCode}
                onChange={e => {
                  if (e.target.value.length > 7) return
                  handleFilledPostalCode(e.target.value)
                  setLeaderUserData(s => ({ ...s, postalCode: e.target.value }))
                }}
                hasError={!validator.isEmpty(leaderUserData.postalCode) && !validator.isPostalCode(leaderUserData.postalCode)} />
              <FormHelp>
                ハイフンは入力不要です
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormInput
                placeholder='東京都千代田区外神田9-9-9'
                value={leaderUserData.address}
                onChange={e => setLeaderUserData(s => ({ ...s, address: e.target.value }))} />
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput
                placeholder='07001234567'
                value={leaderUserData.telephone}
                onChange={e => setLeaderUserData(s => ({ ...s, telephone: e.target.value }))} />
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
                placeholder='sumire@sockbase.net'
                value={leaderUserData.email}
                onChange={e => setLeaderUserData(s => ({ ...s, email: e.target.value }))}
                hasError={!validator.isEmpty(leaderUserData.email) && !validator.isEmail(leaderUserData.email)} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormInput type="password"
                placeholder='●●●●●●●●●●●●'
                value={leaderUserData.password}
                onChange={e => setLeaderUserData(s => ({ ...s, password: e.target.value }))}
                hasError={!validator.isEmpty(leaderUserData.password) && !validator.isStrongPassword(leaderUserData.password)} />
              <FormHelp hasError={!validator.isEmpty(leaderUserData.password) && !validator.isStrongPassword(leaderUserData.password)}>
                アルファベット大文字を含め、英数12文字以上で設定してください。
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>パスワード(確認)</FormLabel>
              <FormInput type="password"
                placeholder='●●●●●●●●●●●●'
                value={leaderUserData.rePassword}
                onChange={e => setLeaderUserData(s => ({ ...s, rePassword: e.target.value }))}
                hasError={!validator.isEmpty(leaderUserData.rePassword) && leaderUserData.password !== leaderUserData.rePassword} />
              {!validator.isEmpty(leaderUserData.rePassword) && leaderUserData.password !== leaderUserData.rePassword &&
                <FormHelp hasError>パスワードの入力が間違っています</FormHelp>}
            </FormItem>
          </FormSection>
        </>
        : <></>}

      <h2>サークル参加費お支払い方法</h2>
      {
        selectedSpace
          ? <FormSection>
            <FormItem>
              <table>
                <tbody>
                  <tr>
                    <th>申込むスペース</th>
                    <td>{selectedSpace.name}</td>
                  </tr>
                  <tr>
                    <th>スペース詳細情報</th>
                    <td>{selectedSpace.description}</td>
                  </tr>
                  <tr>
                    <th>お支払い額</th>
                    <td>{selectedSpace.price.toLocaleString()}円</td>
                  </tr>
                </tbody>
              </table>
            </FormItem>
            <FormItem>
              <FormRadio
                name="paymentMethod"
                values={sockbaseShared.constants.payment.methods.map(i => ({
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
            placeholder='成人向け作品を頒布するサークルとは離れた場所に配置をお願いします。'
            value={app.remarks}
            onChange={e => setApp(s => ({ ...s, remarks: e.target.value }))}
          ></FormTextarea>
        </FormItem>
      </FormSection>

      <h2>注意事項</h2>
      <p>
        <a href="/tos" target="_blank">Sockbase利用規約</a>および<a href="/privacy-policy" target="_blank">プライバシーポリシー</a>に同意しますか？
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
