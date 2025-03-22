import { useCallback, useEffect, useState } from 'react'
import { type SockbaseStoreType, type SockbaseStore, type SockbaseStoreDocument } from 'sockbase'
import FormButton from '../../../components/Form/FormButton'
import FormCheckbox from '../../../components/Form/FormCheckbox'
import FormInput from '../../../components/Form/FormInput'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/FormLabel'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/FormTextarea'
import useDayjs from '../../../hooks/useDayjs'

interface Props {
  storeId: string | null | undefined
  store: SockbaseStore | null | undefined
  nextStep: (storeId: string, store: SockbaseStore) => void
}
const InformationInput: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const [storePackageJSON, setStorePackageJSON] = useState<string>()

  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState<SockbaseStore>({
    name: '',
    websiteURL: '',
    venue: {
      name: ''
    },
    descriptions: [''],
    rules: [''],
    types: [],
    schedules: {
      startApplication: 0,
      endApplication: 0,
      startEvent: 0,
      endEvent: 0
    },
    _organization: {
      id: '',
      name: '',
      contactUrl: ''
    },
    permissions: {
      canUseBankTransfer: true,
      ticketUserAutoAssign: true
    },
    isPublic: false
  })

  const [editableTypes, setEditableTypes] = useState([{
    id: '',
    name: '',
    description: '',
    price: '',
    color: '',
    isPublic: true,
    anotherTicketStoreId: '',
    anotherTicketTypeId: ''
  }])

  const [openPackageInputArea, setOpenPackageInputArea] = useState(false)
  const [showVenueName, setShowVenueName] = useState(false)

  const handleEditDescription = useCallback((index: number, description: string) => {
    const newDescriptions = [...store.descriptions]
    newDescriptions[index] = description
    setStore(s => ({ ...s, descriptions: newDescriptions }))
  }, [store.descriptions])

  const handleEditRule = useCallback((index: number, rule: string) => {
    const newRules = [...store.rules]
    newRules[index] = rule
    setStore(s => ({ ...s, rules: newRules }))
  }, [store.rules])

  const handleEditType = useCallback((
    index: number,
    id: string,
    name: string,
    description: string,
    price: string,
    color: string,
    anotherTicketStoreId: string,
    anotherTicketTypeId: string,
    isPublic: boolean) => {
    const newTypes = [...editableTypes]
    newTypes[index] = {
      id,
      name,
      description,
      price,
      color,
      isPublic,
      anotherTicketStoreId,
      anotherTicketTypeId
    }
    setEditableTypes(newTypes)
  }, [editableTypes])

  const handleConfirm = useCallback(() => {
    props.nextStep(
      storeId,
      {
        ...store,
        venue: (showVenueName && store.venue) || null,
        descriptions: store.descriptions.filter(d => d),
        rules: store.rules.filter(r => r),
        types: editableTypes
          .filter(t => t.id || t.name || t.description || t.price || t.color || t.anotherTicketStoreId || t.anotherTicketTypeId)
          .map<SockbaseStoreType>(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: Number(t.price),
          color: t.color || '#000000',
          isPublic: t.isPublic,
          anotherTicket: t.anotherTicketStoreId
            ? {
              storeId: t.anotherTicketStoreId,
              typeId: t.anotherTicketTypeId
            }
            : null
        }))
      })
  }, [storeId, store, editableTypes, showVenueName])

  const fetchStore = useCallback((st: SockbaseStore) => {
    const fetchedStore = {
      ...st,
      venue: st.venue || null,
      descriptions: (st.descriptions.length && st.descriptions) || [''],
      rules: (st.rules.length && st.rules) || [''],
      permissions: {
        canUseBankTransfer: !!st.permissions.canUseBankTransfer,
        ticketUserAutoAssign: !!st.permissions.ticketUserAutoAssign
      },
      isPublic: !!st.isPublic
    }

    setStore(fetchedStore)
    setShowVenueName(!!st.venue)

    const fetchedEditableTypes = st.types.length
      ? st.types
        .map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: t.price.toString(),
          color: t.color,
          isPublic: !!t.isPublic,
          anotherTicketStoreId: t.anotherTicket?.storeId ?? '',
          anotherTicketTypeId: t.anotherTicket?.typeId ?? ''
        }))
      : [{
        id: '',
        name: '',
        description: '',
        price: '',
        paymentURL: '',
        productId: '',
        color: '',
        isPublic: true,
        anotherTicketStoreId: '',
        anotherTicketTypeId: ''
      }]
    setEditableTypes(fetchedEditableTypes)
  }, [])

  const handleImportStorePackage = useCallback(() => {
    if (!storePackageJSON) return
    if (!confirm('チケットストア設定データをインポートします。\nよろしいですか？')) return
    const storePackage = JSON.parse(storePackageJSON) as SockbaseStoreDocument
    setStoreId(storePackage.id)
    fetchStore(storePackage)
    setStorePackageJSON('')
    setOpenPackageInputArea(false)
  }, [storePackageJSON])

  const handleTogglePackageInputArea = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    setOpenPackageInputArea(s => !s)
  }, [])

  useEffect(() => {
    if (props.storeId) {
      setStoreId(props.storeId)
    }
    if (props.store) {
      fetchStore(props.store)
    }
  }, [props.storeId, props.store])

  useEffect(() => {
    const descriptionCount = store.descriptions.length
    if (descriptionCount < 1) return

    const lastDescription = store.descriptions[descriptionCount - 1]
    if (lastDescription) {
      const newDescriptions = [...store.descriptions, '']
      setStore(s => ({ ...s, descriptions: newDescriptions }))
      return
    }

    const inputedDescription = store.descriptions[descriptionCount - 2]
    if (inputedDescription) return

    const trimedDescriptions = store.descriptions.slice(undefined, -1)
    if (trimedDescriptions.length < 1) return

    setStore(s => ({ ...s, descriptions: trimedDescriptions }))
  }, [store.descriptions])

  useEffect(() => {
    const ruleCount = store.rules.length
    if (ruleCount < 1) return

    const lastRule = store.rules[ruleCount - 1]
    if (lastRule) {
      const newRules = [...store.rules, '']
      setStore(s => ({ ...s, rules: newRules }))
      return
    }

    const inputedRule = store.rules[ruleCount - 2]
    if (inputedRule) return

    const trimedRules = store.rules.slice(undefined, -1)
    if (trimedRules.length < 1) return

    setStore(s => ({ ...s, rules: trimedRules }))
  }, [store.rules])

  useEffect(() => {
    const typeCount = editableTypes.length
    if (typeCount < 1) return

    const lastType = editableTypes[typeCount - 1]
    if (lastType.id
      || lastType.name
      || lastType.description
      || lastType.price
      || lastType.color
      || !lastType.isPublic
      || lastType.anotherTicketStoreId
      || lastType.anotherTicketTypeId) {
      const newRules = [...editableTypes, {
        id: '',
        name: '',
        description: '',
        price: '',
        paymentURL: '',
        productId: '',
        color: '',
        isPublic: true,
        anotherTicketStoreId: '',
        anotherTicketTypeId: ''
      }]
      setEditableTypes(newRules)
      return
    }

    const inputedType = editableTypes[typeCount - 2]
    if (inputedType?.id
      || inputedType?.name
      || inputedType?.description
      || inputedType?.price
      || inputedType?.color
      || !inputedType?.isPublic
      || inputedType?.anotherTicketStoreId
      || inputedType?.anotherTicketTypeId) {
      return
    }

    const trimedTypes = editableTypes.slice(undefined, -1)
    if (trimedTypes.length < 1) return

    setEditableTypes(trimedTypes)
  }, [editableTypes])

  return (
    <>
      <h2>STEP1: チケットストア情報</h2>

      <h3>インポート</h3>
      <details open={openPackageInputArea}>
        <summary onClick={handleTogglePackageInputArea}>チケットストア設定データ入力欄</summary>
        <FormSection>
          <FormItem>
            <FormLabel>チケットストア設定データ</FormLabel>
            <FormTextarea
              onChange={e => setStorePackageJSON(e.target.value)}
              value={storePackageJSON} />
          </FormItem>
          <FormItem>
            <FormButton
              disabled={!storePackageJSON}
              onClick={handleImportStorePackage}>インポート
            </FormButton>
          </FormItem>
        </FormSection>
      </details>

      <h3>公開設定</h3>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={store.isPublic}
            label="イベントを公開する"
            name="is-public"
            onChange={checked => setStore(s => ({ ...s, isPublic: checked }))} />
        </FormItem>
      </FormSection>

      <h3>チケットストア基礎情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>チケットストア ID</FormLabel>
          <FormInput
            onChange={e => setStoreId(e.target.value)}
            value={storeId} />
        </FormItem>
        <FormItem>
          <FormLabel>チケットストア名</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, name: e.target.value }))}
            value={store.name} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント Web サイト</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, websiteURL: e.target.value }))}
            value={store.websiteURL} />
        </FormItem>
        <FormItem>
          <FormLabel>会場名</FormLabel>
          <FormCheckbox
            checked={showVenueName}
            label="会場名を表示する"
            name="show-venue-name"
            onChange={checked => setShowVenueName(checked)} />
        </FormItem>
        <FormItem>
          <FormInput
            disabled={!showVenueName}
            onChange={e => setStore(s => ({ ...s, venue: { ...s.venue, name: e.target.value } }))}
            value={store.venue?.name} />
        </FormItem>
      </FormSection>

      <h3>組織情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>組織 ID</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, id: e.target.value } }))}
            value={store._organization.id} />
        </FormItem>
        <FormItem>
          <FormLabel>組織名</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, name: e.target.value } }))}
            value={store._organization.name} />
        </FormItem>
        <FormItem>
          <FormLabel>連絡先 URL</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, contactUrl: e.target.value } }))}
            value={store._organization.contactUrl} />
        </FormItem>
      </FormSection>

      <h3>全体スケジュール</h3>
      <FormSection>
        <FormItem>
          <FormLabel>申し込み受付開始</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, startApplication: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(store.schedules.startApplication, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>申し込み受付終了</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, endApplication: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(store.schedules.endApplication, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント開始</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, startEvent: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(store.schedules.startEvent, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
        <FormItem>
          <FormLabel>イベント終了</FormLabel>
          <FormInput
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, endEvent: new Date(e.target.value).getTime() } }))}
            type="datetime-local"
            value={formatByDate(store.schedules.endEvent, 'YYYY-MM-DDTHH:mm')} />
        </FormItem>
      </FormSection>

      <h3>チケットタイプ</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>タイプ ID</th>
            <th style={{ width: '15%' }}>タイプ名</th>
            <th style={{ width: '10%' }}>説明</th>
            <th style={{ width: '10%' }}>価格</th>
            <th>チケットカラー</th>
            <th>アナザーチケットストア ID</th>
            <th>アナザーチケットタイプ ID</th>
            <th>公開</th>
          </tr>
        </thead>
        <tbody>
          {editableTypes.map((t, i) => (
            <tr key={i}>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    e.target.value,
                    t.name,
                    t.description,
                    t.price,
                    t.color,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    t.isPublic)}
                  value={t.id} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    e.target.value,
                    t.description,
                    t.price,
                    t.color,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    t.isPublic)}
                  value={t.name} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    t.name,
                    e.target.value,
                    t.price,
                    t.color,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    t.isPublic)}
                  value={t.description} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    t.name,
                    t.description,
                    e.target.value,
                    t.color,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    t.isPublic)}
                  value={t.price} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    t.name,
                    t.description,
                    t.price,
                    e.target.value,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    t.isPublic
                  )}
                  type="color"
                  value={t.color} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    t.name,
                    t.description,
                    t.price,
                    t.color,
                    e.target.value,
                    t.anotherTicketTypeId,
                    t.isPublic)}
                  value={t.anotherTicketStoreId} />
              </td>
              <td>
                <FormInput
                  onChange={e => handleEditType(
                    i,
                    t.id,
                    t.name,
                    t.description,
                    t.price,
                    t.color,
                    t.anotherTicketStoreId,
                    e.target.value,
                    t.isPublic)}
                  value={t.anotherTicketTypeId} />
              </td>
              <td>
                <FormCheckbox
                  checked={t.isPublic}
                  label="公開"
                  name={`public-${i}`}
                  onChange={checked => handleEditType(
                    i,
                    t.id,
                    t.name,
                    t.description,
                    t.price,
                    t.color,
                    t.anotherTicketStoreId,
                    t.anotherTicketTypeId,
                    checked)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>注意事項</h3>
      <FormSection>
        {store.rules.map((r, i) => (
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
        {store.descriptions.map((d, i) => (
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
            checked={store.permissions.canUseBankTransfer}
            label="参加費の銀行振込を許可する"
            name="canUseBankTransfer"
            onChange={checked => setStore(s => ({ ...s, permissions: { ...s.permissions, canUseBankTransfer: checked } }))} />
        </FormItem>
        <FormItem>
          <FormCheckbox
            checked={store.permissions.ticketUserAutoAssign}
            label="チケット使用者を自動で割り当てる"
            name="ticketUserAutoAssign"
            onChange={checked => setStore(s => ({ ...s, permissions: { ...s.permissions, ticketUserAutoAssign: checked } }))} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem $inlined>
          <FormButton onClick={handleConfirm}>内容確認</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default InformationInput
