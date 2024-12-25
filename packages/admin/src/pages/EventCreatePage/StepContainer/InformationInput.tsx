import { useCallback, useEffect, useState } from 'react'
import FormButton from '../../../components/Form/FormButton'
import FormCheckbox from '../../../components/Form/FormCheckbox'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/FormTextarea'
import EyecatchPreview from '../../../components/Parts/EyecatchPreview'
import useDayjs from '../../../hooks/useDayjs'
import useFile from '../../../hooks/useFile'
import type { SockbaseEvent, SockbaseEventDocument, SockbaseEventSpace } from 'sockbase'

interface Props {
  eventId: string | null | undefined
  event: SockbaseEvent | null | undefined
  eyecatchFile: File | null | undefined
  nextStep: (
    eventId: string,
    event: SockbaseEvent,
    eyecatchFile: File | undefined,
    eyecatchData: string | undefined) => void
}

const InformationImport: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const [eventPackageJSON, setEventPackageJSON] = useState('')

  const [eventId, setEventId] = useState('')
  const [event, setEvent] = useState<SockbaseEvent>({
    name: '',
    websiteURL: '',
    venue: {
      name: ''
    },
    descriptions: [''],
    rules: [''],
    spaces: [],
    genres: [
      {
        id: '',
        name: ''
      }
    ],
    schedules: {
      startApplication: 0,
      endApplication: 0,
      overviewFixedAt: 0,
      publishSpaces: 0,
      startEvent: 0,
      endEvent: 0
    },
    passConfig: {
      storeId: '',
      typeId: ''
    },
    _organization: {
      id: '',
      name: '',
      contactUrl: ''
    },
    permissions: {
      allowAdult: false,
      canUseBankTransfer: true,
      requirePetitCode: false
    },
    isPublic: false
  })

  const [editableSpaces, setEditableSpaces] = useState([{
    id: '',
    name: '',
    description: '',
    price: '',
    productId: '',
    paymentURL: '',
    isDualSpace: false,
    passCount: '',
    acceptApplication: true
  }])

  const {
    data: eyecatchDataWithHook,
    openAsDataURL: openEyecatch
  } = useFile()

  const [eyecatchFile, setEyecatchFile] = useState<File>()
  const [eyecatchData, setEyecatchData] = useState<string>()

  const [openPackageInputArea, setOpenPackageInputArea] = useState(false)

  const handleEditDescription = useCallback((index: number, description: string) => {
    const newDescriptions = [...event.descriptions]
    newDescriptions[index] = description
    setEvent(s => ({ ...s, descriptions: newDescriptions }))
  }, [event.descriptions])

  const handleEditRule = useCallback((index: number, rule: string) => {
    const newRules = [...event.rules]
    newRules[index] = rule
    setEvent(s => ({ ...s, rules: newRules }))
  }, [event.rules])

  const handleEditGenre = useCallback((index: number, id: string, name: string) => {
    const newGenres = [...event.genres]
    newGenres[index].id = id
    newGenres[index].name = name
    setEvent(s => ({ ...s, genres: newGenres }))
  }, [event.genres])

  const handleEditSpace = useCallback((
    index: number,
    id: string,
    name: string,
    description: string,
    price: string,
    paymentURL: string,
    productId: string,
    isDualSpace: boolean,
    passCount: string,
    acceptApplication: boolean) => {
    const newSpaces = [...editableSpaces]
    newSpaces[index] = {
      id,
      name,
      description,
      price,
      productId,
      paymentURL,
      isDualSpace,
      passCount,
      acceptApplication
    }
    setEditableSpaces(newSpaces)
  }, [editableSpaces])

  const handleConfirm = useCallback(() => {
    props.nextStep(
      eventId,
      {
        ...event,
        descriptions: event.descriptions.filter(d => d),
        rules: event.rules.filter(r => r),
        genres: event.genres.filter(g => g.id || g.name),
        spaces: editableSpaces
          .filter(s => s.id || s.name || s.description || s.price || s.paymentURL || s.productId)
          .map<SockbaseEventSpace>(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: Number(s.price.replace(/\D/g, '')),
          productInfo: (Number(s.price.replace(/\D/g, '')) > 0 && {
            paymentURL: s.paymentURL,
            productId: s.productId
          }) || null,
          isDualSpace: s.isDualSpace,
          passCount: Number(s.passCount.replace(/\D/g, '')),
          acceptApplication: s.acceptApplication
        }))
      },
      eyecatchFile,
      eyecatchData)
  }, [eventId, event, editableSpaces, eyecatchFile, eyecatchData])

  const fetchEvent = useCallback((ev: SockbaseEvent) => {
    const fetchedEvent = {
      ...ev,
      descriptions: (ev.descriptions.length && ev.descriptions) || [''],
      rules: (ev.rules.length && ev.rules) || [''],
      genres: (ev.genres.length && ev.genres) || [{
        id: '',
        name: ''
      }],
      permissions: {
        allowAdult: !!ev.permissions.allowAdult,
        canUseBankTransfer: !!ev.permissions.canUseBankTransfer,
        requirePetitCode: !!ev.permissions.requirePetitCode
      },
      schedules: {
        startApplication: ev.schedules.startApplication ?? 0,
        endApplication: ev.schedules.endApplication ?? 0,
        overviewFixedAt: ev.schedules.overviewFixedAt ?? 0,
        publishSpaces: ev.schedules.publishSpaces ?? 0,
        startEvent: ev.schedules.startEvent ?? 0,
        endEvent: ev.schedules.endEvent ?? 0
      },
      isPublic: !!ev.isPublic,
      passConfig: {
        storeId: ev.passConfig?.storeId ?? '',
        typeId: ev.passConfig?.typeId ?? ''
      }
    }
    setEvent(fetchedEvent)

    const fetchedEditableSpaces = ev.spaces.length
      ? ev.spaces
        .map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price.toString(),
          productId: s.productInfo?.productId ?? '',
          paymentURL: s.productInfo?.paymentURL ?? '',
          isDualSpace: !!s.isDualSpace,
          passCount: s.passCount?.toString() ?? '',
          acceptApplication: !!s.acceptApplication
        }))
      : [{
        id: '',
        name: '',
        description: '',
        price: '',
        productId: '',
        paymentURL: '',
        isDualSpace: false,
        passCount: '',
        acceptApplication: true
      }]
    setEditableSpaces(fetchedEditableSpaces)
  }, [])

  const handleImportEventPackage = useCallback(() => {
    if (!eventPackageJSON) return
    if (!confirm('イベント設定データをインポートします。\nよろしいですか？')) return
    const eventPackage = JSON.parse(eventPackageJSON) as SockbaseEventDocument
    setEventId(eventPackage.id)
    fetchEvent(eventPackage)
    setEventPackageJSON('')
    setOpenPackageInputArea(false)
  }, [eventPackageJSON])

  const handleTogglePackageInputArea = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    setOpenPackageInputArea(s => !s)
  }, [])

  useEffect(() => {
    if (!eyecatchFile) return
    openEyecatch(eyecatchFile)
  }, [eyecatchFile])

  useEffect(() => {
    if (props.eventId) {
      setEventId(props.eventId)
    }
    if (props.event) {
      fetchEvent(props.event)
    }
    if (props.eyecatchFile) {
      setEyecatchFile(props.eyecatchFile)
    }
  }, [props.eventId, props.event, props.eyecatchFile])

  useEffect(() => {
    if (!eyecatchDataWithHook) return
    setEyecatchData(eyecatchDataWithHook)
  }, [eyecatchDataWithHook])

  useEffect(() => {
    const descriptionCount = event.descriptions.length
    if (descriptionCount < 1) return

    const lastDescription = event.descriptions[descriptionCount - 1]
    if (lastDescription) {
      const newDescriptions = [...event.descriptions, '']
      setEvent(s => ({ ...s, descriptions: newDescriptions }))
      return
    }

    const inputedDescription = event.descriptions[descriptionCount - 2]
    if (inputedDescription) return

    const trimedDescriptions = event.descriptions.slice(undefined, -1)
    if (trimedDescriptions.length < 1) return

    setEvent(s => ({ ...s, descriptions: trimedDescriptions }))
  }, [event.descriptions])

  useEffect(() => {
    const ruleCount = event.rules.length
    if (ruleCount < 1) return

    const lastRule = event.rules[ruleCount - 1]
    if (lastRule) {
      const newRules = [...event.rules, '']
      setEvent(s => ({ ...s, rules: newRules }))
      return
    }

    const inputedRule = event.rules[ruleCount - 2]
    if (inputedRule) return

    const trimedRules = event.rules.slice(undefined, -1)
    if (trimedRules.length < 1) return

    setEvent(s => ({ ...s, rules: trimedRules }))
  }, [event.rules])

  useEffect(() => {
    const genreCount = event.genres.length
    if (genreCount < 1) return

    const lastGenre = event.genres[genreCount - 1]
    if (lastGenre.id || lastGenre.name) {
      const newGenres = [...event.genres, {
        id: '',
        name: ''
      }]
      setEvent(s => ({ ...s, genres: newGenres }))
      return
    }

    const inputedGenre = event.genres[genreCount - 2]
    if (inputedGenre?.id || inputedGenre?.name) return

    const trimedGenres = event.genres.slice(undefined, -1)
    if (trimedGenres.length < 1) return

    setEvent(s => ({ ...s, genres: trimedGenres }))
  }, [event.genres])

  useEffect(() => {
    const spaceCount = editableSpaces.length
    if (spaceCount < 1) return

    const lastSpace = editableSpaces[spaceCount - 1]
    if (lastSpace.id
      || lastSpace.name
      || lastSpace.description
      || lastSpace.price
      || lastSpace.paymentURL
      || lastSpace.productId
      || lastSpace.isDualSpace
      || lastSpace.passCount
      || !lastSpace.acceptApplication) {
      const newSpaces = [...editableSpaces, {
        id: '',
        name: '',
        description: '',
        price: '',
        paymentURL: '',
        productId: '',
        isDualSpace: false,
        passCount: '',
        acceptApplication: true
      }]
      setEditableSpaces(newSpaces)
      return
    }

    const inputedSpace = editableSpaces[spaceCount - 2]
    if (inputedSpace?.id
      || inputedSpace?.name
      || inputedSpace?.description
      || inputedSpace?.price
      || inputedSpace?.paymentURL
      || inputedSpace?.productId
      || inputedSpace?.isDualSpace
      || inputedSpace?.passCount
      || !inputedSpace?.acceptApplication) return

    const trimedSpaces = editableSpaces.slice(undefined, -1)
    if (trimedSpaces.length < 1) return

    setEditableSpaces(trimedSpaces)
  }, [editableSpaces])

  return (
    <>
      <h2>STEP1: イベント情報入力</h2>

      <h3>インポート</h3>
      <details open={openPackageInputArea}>
        <summary onClick={handleTogglePackageInputArea}>イベント設定データ入力欄</summary>
        <FormSection>
          <FormItem>
            <FormLabel>イベント設定データ</FormLabel>
            <FormTextarea
              onChange={e => setEventPackageJSON(e.target.value)}
              value={eventPackageJSON} />
          </FormItem>
          <FormItem>
            <FormButton
              disabled={!eventPackageJSON}
              onClick={handleImportEventPackage}>インポート
            </FormButton>
          </FormItem>
        </FormSection>
      </details>

      <h3>公開設定</h3>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={event.isPublic}
            label="イベントを公開する"
            name="is-public"
            onChange={checked => setEvent(s => ({ ...s, isPublic: checked }))} />
        </FormItem>
      </FormSection>

      <h3>イベント基礎情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>イベント ID</FormLabel>
          <FormInput
            onChange={e => setEventId(e.target.value)}
            value={eventId} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント名</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, name: e.target.value }))}
            value={event.name} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント Web サイト</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, websiteURL: e.target.value }))}
            value={event.websiteURL} />
        </FormItem>
        <FormItem>
          <FormLabel>会場名</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, venue: { ...s.venue, name: e.target.value } }))}
            value={event.venue.name} />
        </FormItem>
        <FormItem>
          <FormLabel>アイキャッチ画像</FormLabel>
          <FormInput
            accept="image/*"
            onChange={e => setEyecatchFile(e.target.files?.[0])}
            type="file" />
        </FormItem>
        {eyecatchData && (
          <FormItem>
            <EyecatchPreview src={eyecatchData} />
          </FormItem>
        )}
      </FormSection>

      <h3>組織情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>組織 ID</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, _organization: { ...s._organization, id: e.target.value } }))}
            value={event._organization.id} />
        </FormItem>
        <FormItem>
          <FormLabel>組織名</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, _organization: { ...s._organization, name: e.target.value } }))}
            value={event._organization.name} />
        </FormItem>
        <FormItem>
          <FormLabel>連絡先 URL</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, _organization: { ...s._organization, contactUrl: e.target.value } }))}
            value={event._organization.contactUrl} />
        </FormItem>
      </FormSection>

      <h3>サークル通行証情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>チケットストア ID</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, passConfig: s.passConfig && { ...s.passConfig, storeId: e.target.value } }))}
            value={event.passConfig?.storeId} />
        </FormItem>
        <FormItem>
          <FormLabel>チケットタイプ ID</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, passConfig: s.passConfig && { ...s.passConfig, typeId: e.target.value } }))}
            value={event.passConfig?.typeId} />
        </FormItem>
      </FormSection>
      <h3>全体スケジュール</h3>
      <FormSection>
        <FormItem>
          <FormLabel>申し込み受付開始</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, startApplication: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.startApplication, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>申し込み受付終了</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, endApplication: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.endApplication, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>サークル情報変更締切</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, overviewFixedAt: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.overviewFixedAt, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>配置発表</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, publishSpaces: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.publishSpaces, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント開始</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, startEvent: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.startEvent, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント終了</FormLabel>
          <FormInput
            onChange={e => setEvent(s => ({ ...s, schedules: { ...s.schedules, endEvent: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(event.schedules.endEvent, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
      </FormSection>

      <h3>配置希望ジャンル</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>ジャンル ID</th>
            <th>ジャンル名</th>
          </tr>
        </thead>
        <tbody>
          {event.genres.map((g, i) => (
            <tr key={i}>
              <td>
                <FormInput
                  onChange={e => handleEditGenre(i, e.target.value, g.name)}
                  value={g.id} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditGenre(i, g.id, e.target.value)}
                  value={g.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>スペース</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>スペース ID</th>
            <th style={{ width: '10%' }}>名前</th>
            <th style={{ width: '25%' }}>説明</th>
            <th>参加費</th>
            <th>支払い URL</th>
            <th>商品 ID</th>
            <th>通行証枚数</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {editableSpaces.map((s, i) => (
            <tr key={i}>
              <td>
                <FormInput
                  onChange={e => handleEditSpace(
                    i,
                    e.target.value,
                    s.name,
                    s.description,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.id} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    e.target.value,
                    s.description,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.name} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    e.target.value,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.description} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    e.target.value,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.price} />
              </td>
              <td>
                <FormInput
                  disabled={Number(s.price.replaceAll(/\D/g, '')) <= 0}
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    s.price,
                    e.target.value,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.paymentURL} />
              </td>
              <td>
                <FormInput
                  disabled={Number(s.price.replaceAll(/\D/g, '')) <= 0}
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    s.price,
                    s.paymentURL,
                    e.target.value,
                    s.isDualSpace,
                    s.passCount,
                    s.acceptApplication)}
                  value={s.productId} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    e.target.value,
                    s.acceptApplication)}
                  value={s.passCount} />
              </td>
              <td>
                <FormCheckbox
                  checked={s.isDualSpace}
                  label="2 スペース"
                  name={`is-dualspace-${i}`}
                  onChange={checked => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    checked,
                    s.passCount,
                    s.acceptApplication)} />
              </td>
              <td>
                <FormCheckbox
                  checked={s.acceptApplication}
                  label="受入"
                  name={`allow-application-${i}`}
                  onChange={checked => handleEditSpace(
                    i,
                    s.id,
                    s.name,
                    s.description,
                    s.price,
                    s.paymentURL,
                    s.productId,
                    s.isDualSpace,
                    s.passCount,
                    checked)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>注意事項</h3>
      <FormSection>
        {event.rules.map((r, i) => (
          <FormItem key={i}>
            <FormLabel>注意事項 {i + 1}</FormLabel>
            <FormInput
              onChange={e => handleEditRule(i, e.target.value)}
              value={r} />
          </FormItem>
        ))}
      </FormSection>

      <h3>申し込み説明</h3>
      <FormSection>
        {event.descriptions.map((d, i) => (
          <FormItem key={i}>
            <FormLabel>申し込み説明 {i + 1}</FormLabel>
            <FormInput
              onChange={e => handleEditDescription(i, e.target.value)}
              value={d} />
          </FormItem>
        ))}
      </FormSection>

      <h3>制限設定</h3>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={event.permissions.allowAdult}
            label="成人向け頒布を許可する"
            name="allowAdult"
            onChange={checked => setEvent(s => ({ ...s, permissions: { ...s.permissions, allowAdult: checked } }))} />
        </FormItem>
        <FormItem>
          <FormCheckbox
            checked={event.permissions.canUseBankTransfer}
            label="参加費の銀行振込を許可する"
            name="canUseBankTransfer"
            onChange={checked => setEvent(s => ({ ...s, permissions: { ...s.permissions, canUseBankTransfer: checked } }))} />
        </FormItem>
        <FormItem>
          <FormCheckbox
            checked={event.permissions.requirePetitCode}
            label="プチオンリーコードの入力を必須とする"
            name="requirePetitCode"
            onChange={checked => setEvent(s => ({ ...s, permissions: { ...s.permissions, requirePetitCode: checked } }))} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton onClick={handleConfirm}>内容確認</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default InformationImport
