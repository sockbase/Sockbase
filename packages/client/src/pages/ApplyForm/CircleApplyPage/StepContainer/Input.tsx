import { useCallback, useEffect, useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import FormHelp from '../../../../components/Form/Help'
import FormInput from '../../../../components/Form/Input'
import FormLabel from '../../../../components/Form/Label'
import FormRadio from '../../../../components/Form/Radio'
import FormSelect from '../../../../components/Form/Select'
import FormTextarea from '../../../../components/Form/Textarea'
import Alert from '../../../../components/Parts/Alert'
import CircleCutImage from '../../../../components/Parts/CircleCutImage'
import UserDataForm from '../../../../components/UserDataForm'
import useDayjs from '../../../../hooks/useDayjs'
import useFile from '../../../../hooks/useFile'
import useValidate from '../../../../hooks/useValidate'
import type {
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseApplication,
  SockbaseApplicationDocument,
  SockbaseApplicationLinks,
  SockbaseEventDocument
} from 'sockbase'

const initialAppBase = {
  eventId: '',
  spaceId: '',
  circle: {
    name: '',
    yomi: '',
    penName: '',
    penNameYomi: '',
    hasAdult: '',
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
  event: SockbaseEventDocument
  app: SockbaseApplication | undefined
  links: SockbaseApplicationLinks | undefined
  userData: SockbaseAccountSecure | undefined
  circleCutFile: File | null | undefined
  pastApps: SockbaseApplicationDocument[] | null | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinks | null> | null | undefined
  pastEvents: Record<string, SockbaseEventDocument> | null | undefined
  fetchedUserData: SockbaseAccount | null | undefined
  prevStep: () => void
  nextStep: (
    app: SockbaseApplication,
    links: SockbaseApplicationLinks,
    userData: SockbaseAccountSecure | undefined,
    circleCutData: string,
    circleCutFile: File
  ) => void
}

const Input: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { formatByDate } = useDayjs()
  const {
    data: circleCutDataWithHook,
    openAsDataURL: openCircleCut
  } = useFile()

  const initialApp = useMemo(() => ({
    ...initialAppBase,
    eventId: props.event.id,
    paymentMethod: (!props.event.permissions.canUseBankTransfer && 'online') || ''
  }), [props.event])

  const [app, setApp] = useState(initialApp)
  const [links, setLinks] = useState(initialAppLinksBase)
  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [circleCutFile, setCircleCutFile] = useState<File | null>()
  const [circleCutData, setCircleCutData] = useState<string>()

  const [isAgreed, setAgreed] = useState(false)

  const [pastAppId, setPastAppId] = useState<string>()
  const [isAppliedPastApp, setAppliedPastApp] = useState(false)

  const spaceIds = useMemo(() => props.event.spaces.map(s => s.id), [props.event])
  const genreIds = useMemo(() => props.event.genres.map(g => g.id), [props.event])
  const paymentMethodIds = useMemo(() => sockbaseShared.constants.payment.methods
    .filter(p => p.id !== 'bankTransfer' || props.event.permissions.canUseBankTransfer)
    .map(p => p.id), [props.event])

  const selectedSpace = useMemo(() => {
    const space = props.event.spaces.filter(s => s.id === app.spaceId)[0]
    return space
  }, [props.event, app.spaceId])

  const errorCount = useMemo(() => {
    const validators = [
      validator.isIn(app.spaceId, spaceIds),
      !validator.isNull(circleCutFile),
      circleCutData && validator.isNotEmpty(circleCutData),
      validator.isNotEmpty(app.circle.name),
      validator.isOnlyHiragana(app.circle.yomi),
      validator.isNotEmpty(app.circle.penName),
      validator.isOnlyHiragana(app.circle.penNameYomi),
      props.event.permissions.allowAdult || !app.circle.hasAdult,
      validator.isIn(app.circle.genre, genreIds),
      validator.isNotEmpty(app.overview.description),
      validator.isNotEmpty(app.overview.totalAmount),
      validator.isIn(app.paymentMethod, paymentMethodIds),
      !app.unionCircleId || validator.isApplicationHashId(app.unionCircleId),
      !links.twitterScreenName || validator.isTwitterScreenName(links.twitterScreenName),
      !links.pixivUserId || validator.isOnlyNumber(links.pixivUserId),
      !links.websiteURL || validator.isURL(links.websiteURL),
      !links.menuURL || validator.isURL(links.menuURL),
      isAgreed
    ]

    let errorCount = validators.filter(v => !v).length

    if (props.fetchedUserData) {
      const additionalUserDataValidators = [
        props.fetchedUserData.gender || validator.isIn(userData?.gender?.toString() ?? '', ['1', '2'])
      ]
      errorCount += additionalUserDataValidators.filter(v => !v).length
    } else {
      if (!userData) return 1
      const userDataValidators = [
        validator.isNotEmpty(userData.name),
        validator.isPostalCode(userData.postalCode),
        validator.isEmail(userData.email),
        validator.isStrongPassword(userData.password),
        validator.isNotEmpty(userData.rePassword),
        validator.isIn(userData.gender?.toString() ?? '', ['1', '2']),
        validator.equals(userData.password, userData.rePassword)
      ]
      errorCount += userDataValidators.filter(v => !v).length
    }

    return errorCount
  }, [
    props.event,
    props.fetchedUserData,
    spaceIds,
    genreIds,
    paymentMethodIds,
    app,
    userData,
    links,
    circleCutFile,
    circleCutData,
    isAgreed
  ])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0) return
    if (!circleCutData || !circleCutFile) return
    const sanitizedApp: SockbaseApplication = {
      ...app,
      circle: {
        ...app.circle,
        hasAdult: props.event.permissions.allowAdult && app.circle.hasAdult === 'yes'
      }
    }
    const sanitizedLinks: SockbaseApplicationLinks = {
      ...links
    }
    props.nextStep(sanitizedApp, sanitizedLinks, userData, circleCutData, circleCutFile)
  }, [errorCount, props.event, app, links, userData, circleCutData, circleCutFile])

  const handleApplyPastApp = useCallback(() => {
    if (!pastAppId) return
    if (!props.pastApps || !props.pastAppLinks || !props.pastEvents) return

    const pastApp = props.pastApps?.filter(a => a.id === pastAppId)[0]
    if (!pastApp) return
    if (!confirm(`${pastApp.circle.name} (${props.pastEvents[pastApp.eventId].eventName}) から申し込み情報を引用します。\nよろしいですか？`)) return

    setApp({
      ...pastApp,
      circle: {
        ...pastApp.circle,
        genre: '',
        hasAdult: props.event.permissions.allowAdult
          ? pastApp.circle.hasAdult
            ? 'yes'
            : 'no'
          : ''
      },
      eventId: props.event.id,
      spaceId: '',
      unionCircleId: '',
      petitCode: '',
      paymentMethod: ''
    })

    const pastLinks = props.pastAppLinks[pastApp.id]
    if (pastLinks) {
      setLinks(pastLinks)
    }

    setAppliedPastApp(true)
  }, [pastAppId, props.pastApps, props.pastAppLinks, props.pastEvents])

  useEffect(() => {
    if (props.app) {
      setApp({
        ...props.app,
        circle: {
          ...props.app.circle,
          hasAdult: props.app.circle.hasAdult ? 'yes' : 'no'
        },
        paymentMethod: (!props.event.permissions.canUseBankTransfer && 'online') || props.app.paymentMethod
      })
    }

    if (props.links) {
      setLinks(props.links)
    }

    if (props.userData) {
      setUserData(props.userData)
    }

    if (props.circleCutFile) {
      setCircleCutFile(props.circleCutFile)
    }
  }, [props.app, props.links, props.event, props.userData, props.circleCutFile])

  useEffect(() => {
    if (!circleCutFile) return
    openCircleCut(circleCutFile)
  }, [circleCutFile])

  useEffect(() => {
    if (!circleCutDataWithHook) return
    setCircleCutData(circleCutDataWithHook)
  }, [circleCutDataWithHook])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton
            color="default"
            onClick={props.prevStep}>
              申し込み説明画面へ戻る
          </FormButton>
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
              inlined>
                引用する
            </FormButton>
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
            onChange={spaceId => setApp(s => ({ ...s, spaceId }))}
            value={app.spaceId}
            hasError={isAppliedPastApp && !app.spaceId} />
        </FormItem>
      </FormSection>

      <h2>サークルカット</h2>
      <ul>
        <li>テンプレートを使用し、<u>PNG 形式でのご提出をお願いいたします。</u></li>
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
            hasError={isAppliedPastApp && !circleCutData} />
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
          <FormLabel>サークル名 (よみ)</FormLabel>
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
          <FormLabel>ペンネーム (よみ)</FormLabel>
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
        {props.event.permissions.allowAdult && <>
          <FormItem>
            <FormLabel>成人向け頒布物の有無</FormLabel>
            <FormSelect
              value={app.circle.hasAdult}
              onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, hasAdult: e.target.value } }))}>
              <option value="">選択してください</option>
              <option value="no">無: 成人向け頒布物はありません</option>
              <option value="yes">有: 成人向け頒布物があります</option>
            </FormSelect>
          </FormItem>
          <FormItem>
            <Alert>
              成人向け作品を頒布する場合、イベント当日 ({formatByDate(props.event.schedules.startEvent, 'YYYY年 M月 D日')}) 時点で 18 歳以上である必要があります。<br />
              イベント当日時点で未成年の場合、または「無: 成人向け頒布物はありません」を選んだ場合、成人向け作品を頒布することは出来ません。
            </Alert>
          </FormItem>
        </>}
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>頒布物のジャンル</FormLabel>
          <FormSelect
            value={app.circle.genre}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, genre: e.target.value } }))}
            hasError={isAppliedPastApp && !app.circle.genre}>
            <option value="">選択してください</option>
            {props.event.genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </FormSelect>
          <FormHelp hasError={isAppliedPastApp && !app.circle.genre}>
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
            placeholder='合同誌: 1 種 1,000 冊, 既刊: 5 種合計 500 冊, 色紙: 1 枚, グッズ: 3 種合計 30 個'
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

      <h2>隣接配置希望 (合体) 情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>合体希望サークル 申し込み ID</FormLabel>
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
            @ を除いて入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>pixiv</FormLabel>
          <FormInput
            placeholder='1234567890'
            value={links.pixivUserId ?? ''}
            onChange={e => setLinks(s => ({ ...s, pixivUserId: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.pixivUserId && !validator.isOnlyNumber(links.pixivUserId)}>
            ID 部分のみを入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>Web サイト</FormLabel>
          <FormInput
            placeholder='https://sumire.sockbase.net'
            value={links.websiteURL ?? ''}
            onChange={e => setLinks(s => ({ ...s, websiteURL: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.websiteURL && !validator.isURL(links.websiteURL)}>
            http:// から始めてください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>お品書き URL</FormLabel>
          <FormInput
            placeholder='https://oshina.sockbase.net'
            value={links.menuURL ?? ''}
            onChange={e => setLinks(s => ({ ...s, menuURL: e.target.value.trim() }))} />
          <FormHelp hasError={!!links.menuURL && !validator.isURL(links.menuURL)}>
            http:// から始めてください
          </FormHelp>
        </FormItem>
      </FormSection>

      <UserDataForm
        fetchedUserData={props.fetchedUserData}
        userData={props.userData}
        setUserData={u => setUserData(u)} />

      <h2>サークル参加費お支払い方法</h2>
      {selectedSpace
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
              values={sockbaseShared.constants.payment.methods
                .filter(i => i.id !== 'bankTransfer' || props.event.permissions.canUseBankTransfer)
                .map(i => ({
                  text: i.description,
                  value: i.id
                }))}
              value={app.paymentMethod}
              onChange={paymentMethod => setApp(s => ({ ...s, paymentMethod }))}
              hasError={isAppliedPastApp && !app.paymentMethod}/>
          </FormItem>
          {app.paymentMethod === 'bankTransfer' && <FormItem>
            <Alert>
              銀行振込の場合、申し込み完了までお時間をいただくことがございます。
            </Alert>
          </FormItem>}
        </FormSection>
        : <Alert>申し込みたいスペース数を選択してください</Alert>}

      <h2>通信欄</h2>
      <p>申し込みにあたり運営チームへの要望等がありましたら入力してください。</p>
      <Alert>
        合同誌の発行予定がある場合や、今までのイベントで長い待機列が出来たことがある場合は、その旨をご記入いただけますと幸いです。<br />
        追って運営チームよりご状況等をお伺いする場合がございます。
      </Alert>
      <FormSection>
        <FormItem>
          <FormTextarea
            placeholder='◯◯◯◯ (イベント名) にて△△人ほどの待機列が出来たことがあります。'
            value={app.remarks}
            onChange={e => setApp(s => ({ ...s, remarks: e.target.value }))}
          ></FormTextarea>
        </FormItem>
      </FormSection>

      <h2>注意事項</h2>
      <p>
        <a href="/tos" target="_blank">Sockbase 利用規約</a> および <a href="/privacy-policy" target="_blank">プライバシーポリシー</a> に同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAggreed"
            label="同意します"
            onChange={checked => setAgreed(checked)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>

      {errorCount > 0 && <Alert type="danger">
        {errorCount} 個の入力項目に不備があります。
      </Alert>}
      <FormSection>
        <FormButton
          disabled={!isAgreed || errorCount > 0}
          onClick={handleSubmit}>
            入力内容確認画面へ進む
        </FormButton>
      </FormSection>
    </>
  )
}

export default Input
