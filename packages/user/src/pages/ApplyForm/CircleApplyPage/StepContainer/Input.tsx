import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdArrowBack, MdArrowForward, MdFileOpen } from 'react-icons/md'
import sockbaseShared from 'shared'
import FormButton from '../../../../components/Form/FormButton'
import FormCheckbox from '../../../../components/Form/FormCheckbox'
import FormHelp from '../../../../components/Form/FormHelp'
import FormInput from '../../../../components/Form/FormInput'
import FormItem from '../../../../components/Form/FormItem'
import FormLabel from '../../../../components/Form/FormLabel'
import FormRadio from '../../../../components/Form/FormRadio'
import FormSection from '../../../../components/Form/FormSection'
import FormSelect from '../../../../components/Form/FormSelect'
import FormTextarea from '../../../../components/Form/FormTextarea'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import UserDataForm from '../../../../components/UserDataForm'
import useDayjs from '../../../../hooks/useDayjs'
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
  pastApps: SockbaseApplicationDocument[] | null | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinks | null> | null | undefined
  pastEvents: Record<string, SockbaseEventDocument> | null | undefined
  fetchedUserData: SockbaseAccount | null | undefined
  prevStep: () => void
  nextStep: (
    app: SockbaseApplication,
    links: SockbaseApplicationLinks,
    userData: SockbaseAccountSecure | undefined
  ) => void
}

const Input: React.FC<Props> = props => {
  const validator = useValidate()
  const { formatByDate } = useDayjs()

  const initialApp = useMemo(() => ({
    ...initialAppBase,
    eventId: props.event.id,
    paymentMethod: (!props.event.permissions.canUseBankTransfer && 'online') || ''
  }), [props.event])

  const [app, setApp] = useState(initialApp)
  const [links, setLinks] = useState(initialAppLinksBase)
  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [isAgreed, setAgreed] = useState(false)

  const [pastAppId, setPastAppId] = useState('')
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
      validator.isNotEmpty(app.circle.name),
      validator.isOnlyHiragana(app.circle.yomi),
      validator.isNotEmpty(app.circle.penName),
      validator.isOnlyHiragana(app.circle.penNameYomi),
      validator.isIn(app.circle.genre, genreIds),
      validator.isNotEmpty(app.overview.description),
      validator.isNotEmpty(app.overview.totalAmount),
      validator.isIn(app.paymentMethod, paymentMethodIds),
      !app.unionCircleId || validator.isApplicationHashId(app.unionCircleId),
      !links.twitterScreenName || validator.isTwitterScreenName(links.twitterScreenName),
      !links.pixivUserId || validator.isOnlyNumber(links.pixivUserId),
      !links.websiteURL || validator.isURL(links.websiteURL),
      !links.menuURL || validator.isURL(links.menuURL),
      !app.circle.hasAdult || app.circle.hasAdult === 'no' || (props.event.permissions.allowAdult && app.circle.hasAdult === 'yes'),
      props.event.permissions.canUseBankTransfer || app.paymentMethod === 'online',
      isAgreed
    ]

    console.log(validators)

    let errorCount = validators.filter(v => !v).length

    if (props.fetchedUserData) {
      const additionalUserDataValidators = [
        props.fetchedUserData.gender || validator.isIn(userData?.gender?.toString() ?? '', ['1', '2'])
      ]
      errorCount += additionalUserDataValidators.filter(v => !v).length
    }
    else {
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
    isAgreed
  ])

  const handleSubmit = useCallback(() => {
    if (errorCount > 0) return

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
    props.nextStep(sanitizedApp, sanitizedLinks, userData)
  }, [errorCount, props.event, app, links, userData])

  const handleApplyPastApp = useCallback(() => {
    if (!pastAppId) return
    if (!props.pastApps || !props.pastAppLinks || !props.pastEvents) return

    const pastApp = props.pastApps?.filter(a => a.id === pastAppId)[0]
    if (!pastApp) return
    if (!confirm(`${pastApp.circle.name} (${props.pastEvents[pastApp.eventId].name}) から申し込み情報を引用します。\nよろしいですか？`)) return

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
    setPastAppId('')
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
  }, [props.app, props.links, props.event, props.userData])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton onClick={props.prevStep}>
            <IconLabel
              icon={<MdArrowBack />}
              label="申し込み説明画面へ戻る" />
          </FormButton>
        </FormItem>
      </FormSection>

      {props.pastApps && props.pastApps.length > 0 && (
        <>
          <h2>過去の申し込み情報を引用</h2>
          <FormSection>
            <FormItem>
              <FormLabel>引用する申し込み情報</FormLabel>
              <FormSelect
                onChange={e => setPastAppId(e.target.value)}
                value={pastAppId}>
                <option value="">選択してください</option>
                {props.pastApps.map(a => (
                  <option
                    key={a.id}
                    value={a.id}>{a.circle.name} ({props.pastEvents?.[a.eventId].name})
                  </option>
                ))}
              </FormSelect>
            </FormItem>
            <FormItem>
              <FormButton
                color="primary"
                disabled={pastAppId === ''}
                onClick={handleApplyPastApp}>
                <IconLabel
                  icon={<MdFileOpen />}
                  label="引用する" />
              </FormButton>
            </FormItem>
          </FormSection>
        </>
      )}

      <h2>申込むスペース数</h2>
      <FormSection>
        <FormItem>
          <FormLabel>スペース数</FormLabel>
          <FormRadio
            hasError={isAppliedPastApp && !app.spaceId}
            name="space"
            onChange={spaceId => setApp(s => ({ ...s, spaceId }))}
            value={app.spaceId}
            values={
              props.event.spaces
                .filter(s => s.acceptApplication)
                .map(s => ({
                  text: `${s.name} ${s.price.toLocaleString()}円 / ${s.description}`,
                  value: s.id
                }))
            } />
        </FormItem>
      </FormSection>

      <h2>サークル情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>サークル名</FormLabel>
          <FormInput
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, name: e.target.value } }))}
            placeholder="サークル名"
            value={app.circle.name} />
        </FormItem>

        <FormItem>
          <FormLabel>サークル名 (よみ)</FormLabel>
          <FormInput
            hasError={!validator.isEmpty(app.circle.yomi) && !validator.isOnlyHiragana(app.circle.yomi)}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, yomi: e.target.value } }))}
            placeholder="さーくるめい"
            value={app.circle.yomi} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム</FormLabel>
          <FormInput
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penName: e.target.value } }))}
            placeholder="ペンネーム"
            value={app.circle.penName} />
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム (よみ)</FormLabel>
          <FormInput
            hasError={!validator.isEmpty(app.circle.penNameYomi) && !validator.isOnlyHiragana(app.circle.penNameYomi)}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, penNameYomi: e.target.value } }))}
            placeholder="ぺんねーむ"
            value={app.circle.penNameYomi} />
          <FormHelp>
            ひらがなのみで入力してください
          </FormHelp>
        </FormItem>
      </FormSection>

      <h2>頒布物情報</h2>
      <FormSection>
        {props.event.permissions.allowAdult && (
          <>
            <FormItem>
              <FormLabel>成人向け頒布物の有無</FormLabel>
              <FormSelect
                onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, hasAdult: e.target.value } }))}
                value={app.circle.hasAdult}>
                <option value="">選択してください</option>
                <option value="no">無: 成人向け頒布物はありません</option>
                <option value="yes">有: 成人向け頒布物があります</option>
              </FormSelect>
            </FormItem>
            <FormItem>
              <Alert
                title="成人向け作品の頒布について"
                type="warning">
                成人向け作品を頒布する場合、イベント当日 ({formatByDate(props.event.schedules.startEvent, 'YYYY年 M月 D日')}) 時点で 18 歳以上である必要があります。<br />
                イベント当日時点で未成年の場合、または「無: 成人向け頒布物はありません」を選んだ場合、成人向け作品を頒布することは出来ません。
              </Alert>
            </FormItem>
          </>
        )}
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>配置希望ジャンル・カテゴリ</FormLabel>
          <FormSelect
            hasError={isAppliedPastApp && !app.circle.genre}
            onChange={e => setApp(s => ({ ...s, circle: { ...s.circle, genre: e.target.value } }))}
            value={app.circle.genre}>
            <option value="">選択してください</option>
            {props.event.genres.map(g => (
              <option
                key={g.id}
                value={g.id}>{g.name}
              </option>
            ))}
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormLabel>ジャンルコード・プチオンリーコード</FormLabel>
          <FormInput
            hasError={props.event.permissions.requirePetitCode && validator.isEmpty(app.petitCode)}
            onChange={e => setApp(s => ({ ...s, petitCode: e.target.value.trim() }))}
            placeholder="HOGEFUGA00"
            value={app.petitCode} />
          <FormHelp hasError={props.event.permissions.requirePetitCode && validator.isEmpty(app.petitCode)}>
            {props.event.permissions.requirePetitCode
              ? 'イベントサイトにて公開されているジャンルコード・プチオンリーを入力してください。'
              : 'イベント主催者から入力を指示された場合のみ入力してください。'}
          </FormHelp>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>頒布物概要</FormLabel>
          <FormTextarea
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, description: e.target.value } }))}
            placeholder="◯◯◯◯と△△△△のシリアス系合同誌(小説, 漫画)を頒布する予定。その他グッズや既刊あり。"
            value={app.overview.description} />
          <FormHelp>
            スペース配置の参考にしますので、キャラクター名等は正しく入力してください。<br />
            合同誌企画がある場合はその旨も入力してください。
          </FormHelp>
        </FormItem>
        <FormItem>
          <Alert
            title="「頒布物概要」に記載された内容を元に配置します。"
            type="info">
            サークルカットの内容は考慮されませんのでご注意ください。
          </Alert>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormLabel>総搬入量</FormLabel>
          <FormTextarea
            onChange={e => setApp(s => ({ ...s, overview: { ...s.overview, totalAmount: e.target.value } }))}
            placeholder="合同誌: 1 種 1,000 冊, 既刊: 5 種合計 500 冊, 色紙: 1 枚, グッズ: 3 種合計 30 個"
            value={app.overview.totalAmount} />
          <FormHelp>単位まで入力してください。</FormHelp>
        </FormItem>
        <FormItem>
          <Alert
            title="搬入量が決まっていない場合は、最大の持ち込み予定数を入力してください。"
            type="info" />
        </FormItem>
      </FormSection>

      <h2>隣接配置希望 (合体) 情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>合体希望サークル 申し込み ID</FormLabel>
          <FormInput
            hasError={!validator.isEmpty(app.unionCircleId) && !validator.isApplicationHashId(app.unionCircleId)}
            onChange={e => setApp(s => ({ ...s, unionCircleId: e.target.value.trim() }))}
            placeholder="SCXXXXABCDEFGHIJKL"
            value={app.unionCircleId} />
          <FormHelp>先に申し込んだ方から提供された申し込みIDを入力してください。</FormHelp>
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
            onChange={e => setLinks(s => ({ ...s, twitterScreenName: e.target.value.trim() }))}
            placeholder="xxxxxxx"
            value={links.twitterScreenName ?? ''} />
          <FormHelp hasError={!!links.twitterScreenName && !validator.isTwitterScreenName(links.twitterScreenName)}>
            @ を除いて入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>pixiv</FormLabel>
          <FormInput
            onChange={e => setLinks(s => ({ ...s, pixivUserId: e.target.value.trim() }))}
            placeholder="1234567890"
            value={links.pixivUserId ?? ''} />
          <FormHelp hasError={!!links.pixivUserId && !validator.isOnlyNumber(links.pixivUserId)}>
            ID 部分のみを入力してください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>Web サイト</FormLabel>
          <FormInput
            onChange={e => setLinks(s => ({ ...s, websiteURL: e.target.value.trim() }))}
            placeholder="https://sumire.sockbase.net"
            value={links.websiteURL ?? ''} />
          <FormHelp hasError={!!links.websiteURL && !validator.isURL(links.websiteURL)}>
            http:// から始めてください
          </FormHelp>
        </FormItem>
        <FormItem>
          <FormLabel>お品書き URL</FormLabel>
          <FormInput
            onChange={e => setLinks(s => ({ ...s, menuURL: e.target.value.trim() }))}
            placeholder="https://oshina.sockbase.net"
            value={links.menuURL ?? ''} />
          <FormHelp hasError={!!links.menuURL && !validator.isURL(links.menuURL)}>
            http:// から始めてください
          </FormHelp>
        </FormItem>
      </FormSection>

      <UserDataForm
        fetchedUserData={props.fetchedUserData}
        setUserData={u => setUserData(u)}
        userData={props.userData} />

      <h2>サークル参加費お支払い方法</h2>
      {selectedSpace
        ? (
          <FormSection>
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
                hasError={isAppliedPastApp && !app.paymentMethod}
                name="paymentMethod"
                onChange={paymentMethod => setApp(s => ({ ...s, paymentMethod }))}
                value={app.paymentMethod}
                values={sockbaseShared.constants.payment.methods
                  .filter(i => i.id !== 'bankTransfer' || props.event.permissions.canUseBankTransfer)
                  .map(i => ({
                    text: i.description,
                    value: i.id
                  }))} />
            </FormItem>
            {app.paymentMethod === 'bankTransfer' && (
              <FormItem>
                <Alert
                  title="銀行振込の場合、申し込み完了までお時間をいただくことがございます。"
                  type="warning" />
              </FormItem>
            )}
          </FormSection>
        )
        : (
          <Alert
            title="申し込みたいスペース数を選択してください"
            type="info" />
        )}

      <h2>通信欄</h2>
      <p>申し込みにあたり運営チームへの要望等がありましたら入力してください。</p>
      <Alert
        title="通信欄にご入力いただきたい事項について"
        type="info">
        合同誌の発行予定がある場合や、今までのイベントで長い待機列が出来たことがある場合は、その旨をご記入いただけますと幸いです。<br />
        追って運営チームよりご状況等をお伺いする場合がございます。
      </Alert>
      <FormSection>
        <FormItem>
          <FormTextarea
            onChange={e => setApp(s => ({ ...s, remarks: e.target.value }))}
            placeholder="◯◯◯◯ (イベント名) にて△△人ほどの待機列が出来たことがあります。"
            value={app.remarks} />
        </FormItem>
      </FormSection>

      <h2>注意事項</h2>
      <p>
        <a
          href="/tos"
          target="_blank">Sockbase 利用規約
        </a>
        および
        <a
          href="/privacy-policy"
          target="_blank">プライバシーポリシー
        </a>
        に同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={isAgreed}
            label="同意します"
            name="isAggreed"
            onChange={checked => setAgreed(checked)} />
        </FormItem>
      </FormSection>

      {errorCount > 0 && (
        <Alert
          title={`${errorCount} 個の入力項目に不備があります。`}
          type="error" />
      )}

      <FormSection>
        <FormButton
          color="primary"
          disabled={!isAgreed || errorCount > 0}
          onClick={handleSubmit}>
          <IconLabel
            icon={<MdArrowForward />}
            label="入力内容確認画面へ進む" />
        </FormButton>
      </FormSection>
    </>
  )
}

export default Input
