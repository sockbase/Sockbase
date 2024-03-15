import { useCallback, useEffect, useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import {
  type SockbaseEventSpace,
  type SockbaseApplication,
  type SockbaseAccountSecure,
  type SockbaseEvent,
  type SockbaseApplicationLinks,
  type SockbaseApplicationDocument,
  type SockbaseApplicationLinksDocument,
  type SockbaseEventDocument
} from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormHelp from '../../../components/Form/Help'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import FormRadio from '../../../components/Form/Radio'
import FormSelect from '../../../components/Form/Select'
import FormTextarea from '../../../components/Form/Textarea'
import Alert from '../../../components/Parts/Alert'
import CircleCutImage from '../../../components/Parts/CircleCutImage'
import useDayjs from '../../../hooks/useDayjs'
import useFile from '../../../hooks/useFile'
import usePostalCode from '../../../hooks/usePostalCode'
import useValidate from '../../../hooks/useValidate'

const initialAppBase: SockbaseApplication = {
  eventId: '',
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
}

const initialAppLinksBase: SockbaseApplicationLinks = {
  twitterScreenName: '',
  pixivUserId: '',
  websiteURL: '',
  menuURL: ''
}

interface Props {
  eventId: string
  event: SockbaseEvent
  app: SockbaseApplication | undefined
  links: SockbaseApplicationLinks | undefined
  leaderUserData: SockbaseAccountSecure | undefined
  circleCutFile: File | null | undefined
  pastApps: SockbaseApplicationDocument[] | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinksDocument | null> | undefined
  pastEvents: Record<string, SockbaseEventDocument> | undefined
  prevStep: () => void
  nextStep: (app: SockbaseApplication, links: SockbaseApplicationLinks, leaderUserData: SockbaseAccountSecure, circleCutData: string, circleCutFile: File) => void
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

  const initialApp = useMemo(() => ({
    ...initialAppBase,
    eventId: props.eventId
  }), [props.eventId])

  const [app, setApp] = useState<SockbaseApplication>(initialApp)
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
  const [links, setLinks] = useState<SockbaseApplicationLinks>(initialAppLinksBase)

  const [pastAppId, setPastAppId] = useState<string>()
  const [isApplyPastApp, setApplyPastApp] = useState(false)

  const [isAgreed, setAgreed] = useState(false)

  const [spaceIds, setSpaceIds] = useState<string[]>()
  const [paymentMethodIds, setPaymentMethodIds] = useState<string[]>()
  const [isAllValid, setAllValid] = useState(false)
  const [invalidFieldCount, setInvalidFieldCount] = useState(0)

  const handleApplyPastApp = useCallback(() => {
    setApplyPastApp(false)
    if (!props.pastApps || !props.pastAppLinks || !props.pastEvents) return

    if (!pastAppId) {
      if (!confirm('この操作を行うと入力した情報がリセットされます。\nリセットしてもよろしいですか？')) { setApp(initialApp) }
      setLinks(initialAppLinksBase)
      return
    }

    const pastApp = props.pastApps?.filter(a => a.id === pastAppId)[0]
    if (!pastApp) return
    if (!confirm(`${pastApp.circle.name} (${props.pastEvents[pastApp.eventId].eventName}) から申し込み情報を引用します。\nよろしいですか？`)) return

    setApp({
      ...pastApp,
      eventId: props.eventId,
      spaceId: '',
      unionCircleId: '',
      petitCode: ''
    })

    const pastLinks = props.pastAppLinks[pastApp.id]
    if (pastLinks) {
      setLinks(pastLinks)
    }

    setApplyPastApp(true)
  }, [pastAppId, props.pastApps, props.pastAppLinks, props.pastEvents])

  const [error, setError] = useState<string | undefined>()

  const onInitialize = (): void => {
    if (props.app) {
      setApp(props.app)
    }

    if (props.links) {
      setLinks(props.links)
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
  useEffect(onInitialize, [props.app, props.links, props.leaderUserData, props.circleCutFile, props.event])

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
      if (!spaceIds || !paymentMethodIds) return

      const validators = [
        validator.isIn(app.spaceId, spaceIds),
        !validator.isNull(circleCutFile),
        !!circleCutData && !validator.isEmpty(circleCutData),
        !validator.isEmpty(app.circle.name),
        validator.isOnlyHiragana(app.circle.yomi),
        !validator.isEmpty(app.circle.penName),
        validator.isOnlyHiragana(app.circle.penNameYomi),
        !props.event.permissions.allowAdult || !validator.isNull(app.circle.hasAdult),
        validator.isIn(app.circle.genre, props.event.genres.map(g => g.id)),
        !validator.isEmpty(app.overview.description),
        !validator.isEmpty(app.overview.totalAmount),
        validator.isIn(app.paymentMethod, paymentMethodIds),
        (!app.unionCircleId || validator.isApplicationHashId(app.unionCircleId)),
        !links.twitterScreenName || validator.isTwitterScreenName(links.twitterScreenName),
        !links.pixivUserId || validator.isOnlyNumber(links.pixivUserId),
        !links.websiteURL || validator.isURL(links.websiteURL),
        !links.menuURL || validator.isURL(links.menuURL)
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
  useEffect(onChangeForm, [spaceIds, app, links, leaderUserData, circleCutFile, circleCutData, props.event])

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
        birthday: new Date('2000/01/01').getTime(),
        postalCode: '1000001',
        address: '住所',
        telephone: '00012345678',
        email: 'nirsmmy@gmail.com',
        password: 'Password1234',
        rePassword: 'Password1234'
      })
      setDisplayBirthday('2000/01/01')
      setAgreed(true)
    }

  const handleSubmit: () => void =
    () => {
      setError(undefined)
      if (!isAllValid || !circleCutData || !circleCutFile) {
        setError('入力内容に不備があります')
        return
      }

      props.nextStep(app, links, leaderUserData, circleCutData, circleCutFile)
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

      {props.pastApps?.length && <>
        <h2>過去の申し込み情報を引用</h2>
        <FormSection>
          <FormItem>
            <FormLabel>引用する申し込み情報</FormLabel>
            <FormSelect
              value={pastAppId}
              onChange={e => setPastAppId(e.target.value)}>
              <option value="">選択してください</option>
              {props.pastApps.map(a =>
                <option key={a.id} value={a.id}>{a.circle.name} ({props.pastEvents?.[a.eventId].eventName})</option>)}
            </FormSelect>
          </FormItem>
          <FormItem inlined>
            <FormButton
              onClick={handleApplyPastApp}
              disabled={pastAppId === undefined}
              inlined>引用する</FormButton>
          </FormItem>
        </FormSection>
      </>}

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
            value={app.spaceId}
            hasError={isApplyPastApp && !app.spaceId} />
        </FormItem>
      </FormSection>

      <h2>サークルカット</h2>
      <ul>
        <li>テンプレートを使用し、<u>PNG形式でのご提出をお願いいたします。</u></li>
        <li>サークルカットの変更は、申し込み後のマイページから行えます。</li>
        <li>公序良俗に反する画像は使用できません。不特定多数の方の閲覧が可能なためご配慮をお願いいたします。</li>
      </ul>
      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput
            type="file"
            accept="image/png"
            onChange={e => setCircleCutFile(e.target.files?.[0])}
            hasError={isApplyPastApp && !circleCutData}/>
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
          props.event.permissions.allowAdult && <>
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
                <option value="no">無: 成人向け頒布物はありません</option>
                <option value="yes">有: 成人向け頒布物があります</option>
              </FormSelect>
            </FormItem>
            <FormItem>
              <Alert>
                成人向け作品を頒布する場合、イベント当日（{formatByDate(props.event.schedules.startEvent, 'YYYY年M月D日')}）時点で18歳以上である必要があります。
              </Alert>
              <Alert>
                イベント当日時点で未成年の場合、または「無: 成人向け頒布物はありません」を選んだ場合、成人向け作品を頒布することは出来ません。
              </Alert>
            </FormItem>
          </>
        }
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>頒布物のジャンル</FormLabel>
          <FormSelect
            value={app.circle.genre}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, genre: e.target.value } }))}
            hasError={isApplyPastApp && !app.circle.genre}>
            <option value="">選択してください</option>
            {props.event.genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </FormSelect>
          <FormHelp hasError={isApplyPastApp && !app.circle.genre}>
            頒布する作品が複数ある場合、大半を占めるジャンルを選択してください。
          </FormHelp>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>頒布物概要</FormLabel>
          <FormTextarea
            placeholder='◯◯◯◯と△△△△のシリアス系合同誌(小説, 漫画)を頒布する予定。その他グッズや既刊あり。'
            value={app.overview.description}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, description: e.target.value } }))} />
          <FormHelp>
            スペース配置の参考にしますので、キャラクター名等は正しく入力してください。<br />
            合同誌企画がある場合はその旨も入力してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <Alert>
            「頒布物概要」に記載された内容を元に配置します。<br />
            サークルカットの内容は考慮されませんのでご注意ください。
          </Alert>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>総搬入量</FormLabel>
          <FormTextarea
            placeholder='合同誌: 1種1,000冊, 既刊: 5種合計500冊, 色紙: 1枚, グッズ: 3種合計30個'
            value={app.overview.totalAmount}
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, totalAmount: e.target.value } }))} />
          <FormHelp>単位まで入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <Alert>
            搬入量が決まっていない場合は、最大の持ち込み予定数を入力してください。
          </Alert>
        </FormItem>
      </FormSection>

      <h2>隣接配置希望(合体)情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>合体希望サークル 申し込みID</FormLabel>
          <FormInput
            placeholder='20231231235959123-abc0def1'
            value={app.unionCircleId}
            onChange={e => setApp(s => ({ ...s, unionCircleId: e.target.value.trim() }))}
            hasError={!validator.isEmpty(app.unionCircleId) && !validator.isApplicationHashId(app.unionCircleId)} />
          <FormHelp>先に申し込んだ方から提供された申し込みIDを入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>プチオンリーコード</FormLabel>
          <FormInput
            placeholder='marukaku00'
            value={app.petitCode}
            onChange={e => setApp(s => ({ ...s, petitCode: e.target.value.trim() }))} />
          <FormHelp>プチオンリー主催から入力を指示された場合のみ入力してください。</FormHelp>
        </FormItem>
      </FormSection>

      <h2>サークル広報情報</h2>
      <p>
        カタログなどに掲載するサークルの広報情報を入力してください。<br />
        申し込み後も変更できます。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>X (Twitter)</FormLabel>
          <FormInput
            placeholder='xxxxxxx'
            value={links.twitterScreenName ?? ''}
            onChange={e => setLinks(s => ({ ...s, twitterScreenName: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.twitterScreenName && !validator.isTwitterScreenName(links.twitterScreenName)}>
            @を除いて入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>pixiv</FormLabel>
          <FormInput
            placeholder='1234567890'
            value={links.pixivUserId ?? ''}
            onChange={e => setLinks(s => ({ ...s, pixivUserId: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.pixivUserId && !validator.isOnlyNumber(links.pixivUserId)}>
            ID部分のみを入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>Webサイト</FormLabel>
          <FormInput
            placeholder='https://sumire.sockbase.net'
            value={links.websiteURL ?? ''}
            onChange={e => setLinks(s => ({ ...s, websiteURL: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.websiteURL && !validator.isURL(links.websiteURL)}>
            http://から始めてください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>お品書きURL</FormLabel>
          <FormInput
            placeholder='https://oshina.sockbase.net'
            value={links.menuURL ?? ''}
            onChange={e => setLinks(s => ({ ...s, menuURL: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.menuURL && !validator.isURL(links.menuURL)}>
            http://から始めてください
          </FormHelp>
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
                  setLeaderUserData(s => ({ ...s, postalCode: e.target.value.trim() }))
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
              <Alert>住所は都道府県からはじめ、番地・部屋番号まで記入してください。</Alert>
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput
                placeholder='07001234567'
                value={leaderUserData.telephone}
                onChange={e => setLeaderUserData(s => ({ ...s, telephone: e.target.value.trim() }))} />
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
      <Alert>
        合同誌の発行予定がある場合や、今までのイベントで長い待機列が出来たことがある場合は、その旨をご記入いただけますと幸いです。<br />
        追って運営チームよりご状況等をお伺いする場合がございます。
      </Alert>
      <FormSection>
        <FormItem>
          <FormTextarea
            placeholder='◯◯◯◯にて、△△人ほどの待機列が出来たことがあります。今回も最後尾札を用意する予定です。'
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
