import { useCallback, useEffect, useState } from 'react'
import { type SockbaseStoreType, type SockbaseStore, type SockbaseStoreDocument } from 'sockbase'
import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import FormInput from '../../../../components/Form/Input'
import FormLabel from '../../../../components/Form/Label'
import FormTextarea from '../../../../components/Form/Textarea'
import useDayjs from '../../../../hooks/useDayjs'

interface Props {
  storeId: string | null | undefined
  store: SockbaseStore | null | undefined
  nextStep: (storeId: string, store: SockbaseStore) => void
}
const InformationInput: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [storePackageJSON, setStorePackageJSON] = useState<string>()

  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState<SockbaseStore>({
    storeName: '',
    storeWebURL: '',
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
    }
  })

  const [editableTypes, setEditableTypes] = useState([{
    id: '',
    name: '',
    description: '',
    price: '',
    productId: '',
    paymentURL: '',
    color: '',
    isPrivate: true
  }])

  const handleImportStorePackage = useCallback(() => {
    if (!storePackageJSON) return
    if (!confirm('チケットストア設定データをインポートします。\nよろしいですか？')) return
    const storePackage = JSON.parse(storePackageJSON) as SockbaseStoreDocument
    setStoreId(storePackage.id)
    fetchStore(storePackage)
    alert('インポートしました')
  }, [storePackageJSON])

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
    productId: string,
    paymentURL: string,
    color: string,
    isPrivate: boolean) => {
    const newTypes = [...editableTypes]
    newTypes[index] = {
      id,
      name,
      description,
      price,
      productId,
      paymentURL,
      color,
      isPrivate
    }
    setEditableTypes(newTypes)
  }, [editableTypes])

  const handleConfirm = useCallback(() => {
    props.nextStep(
      storeId,
      {
        ...store,
        descriptions: store.descriptions.filter(d => d),
        rules: store.rules.filter(r => r),
        types: editableTypes
          .filter(t => t.id || t.name || t.description || t.price || t.paymentURL || t.productId || t.color)
          .map<SockbaseStoreType>(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: Number(t.price),
          productInfo: ((Number(t.price) > 0 && {
            paymentURL: t.paymentURL,
            productId: t.productId
          })) || null,
          color: t.color,
          private: t.isPrivate
        }))
      })
  }, [storeId, store, editableTypes])

  const fetchStore = useCallback((st: SockbaseStore) => {
    const fetchedStore = {
      ...st,
      descriptions: (st.descriptions.length && st.descriptions) || [''],
      rules: (st.rules.length && st.rules) || ['']
    }
    setStore(fetchedStore)

    const fetchedEditableTypes = st.types.length
      ? st.types
        .map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: t.price.toString(),
          paymentURL: t.productInfo?.paymentURL ?? '',
          productId: t.productInfo?.productId ?? '',
          color: t.color,
          isPrivate: !!t.private
        }))
      : [{
        id: '',
        name: '',
        description: '',
        price: '',
        paymentURL: '',
        productId: '',
        color: '',
        isPrivate: true
      }]
    setEditableTypes(fetchedEditableTypes)
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
    if (lastType.id ||
      lastType.name ||
      lastType.description ||
      lastType.price ||
      lastType.paymentURL ||
      lastType.productId ||
      lastType.color ||
      !lastType.isPrivate) {
      const newRules = [...editableTypes, {
        id: '',
        name: '',
        description: '',
        price: '',
        paymentURL: '',
        productId: '',
        color: '',
        isPrivate: true
      }]
      setEditableTypes(newRules)
      return
    }

    const inputedType = editableTypes[typeCount - 2]
    if (inputedType?.id ||
      inputedType?.name ||
      inputedType?.description ||
      inputedType?.price ||
      inputedType?.paymentURL ||
      inputedType?.productId ||
      inputedType?.color ||
      !inputedType?.isPrivate) return

    const trimedTypes = editableTypes.slice(undefined, -1)
    if (trimedTypes.length < 1) return

    setEditableTypes(trimedTypes)
  }, [editableTypes])

  return (
    <>
      <h2>STEP1: チケットストア情報</h2>

      <h3>インポート</h3>
      <details>
        <summary>チケットストア設定データ入力欄</summary>
        <FormSection>
          <FormItem>
            <FormLabel>チケットストア設定データ</FormLabel>
            <FormTextarea
              value={storePackageJSON}
              onChange={e => setStorePackageJSON(e.target.value)}/>
          </FormItem>
          <FormItem>
            <FormButton onClick={handleImportStorePackage} inlined disabled={!storePackageJSON}>インポート</FormButton>
          </FormItem>
        </FormSection>
      </details>

      <h3>チケットストア基礎情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>チケットストアID</FormLabel>
          <FormInput
            value={storeId}
            onChange={e => setStoreId(e.target.value)} />
        </FormItem>
        <FormItem>
          <FormLabel>チケットストア名</FormLabel>
          <FormInput
            value={store.storeName}
            onChange={e => setStore(s => ({ ...s, storeName: e.target.value }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>イベントWebサイト</FormLabel>
          <FormInput
            value={store.storeWebURL}
            onChange={e => setStore(s => ({ ...s, storeWebURL: e.target.value }))}/>
        </FormItem>
      </FormSection>

      <h3>組織情報</h3>
      <FormSection>
        <FormItem>
          <FormLabel>組織ID</FormLabel>
          <FormInput
            value={store._organization.id}
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, id: e.target.value } }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>組織名</FormLabel>
          <FormInput
            value={store._organization.name}
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, name: e.target.value } }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>連絡先URL</FormLabel>
          <FormInput
            value={store._organization.contactUrl}
            onChange={e => setStore(s => ({ ...s, _organization: { ...s._organization, contactUrl: e.target.value } }))}/>
        </FormItem>
      </FormSection>

      <h3>全体スケジュール</h3>
      <FormSection>
        <FormItem>
          <FormLabel>申し込み受付開始</FormLabel>
          <FormInput
            type="datetime-local"
            value={formatByDate(store.schedules.startApplication, 'YYYY-MM-DDTHH:mm')}
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, startApplication: new Date(e.target.value).getTime() } }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>申し込み受付終了</FormLabel>
          <FormInput
            type="datetime-local"
            value={formatByDate(store.schedules.endApplication, 'YYYY-MM-DDTHH:mm')}
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, endApplication: new Date(e.target.value).getTime() } }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>イベント開始</FormLabel>
          <FormInput
            type="datetime-local"
            value={formatByDate(store.schedules.startEvent, 'YYYY-MM-DDTHH:mm')}
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, startEvent: new Date(e.target.value).getTime() } }))}/>
        </FormItem>
        <FormItem>
          <FormLabel>イベント終了</FormLabel>
          <FormInput
            type="datetime-local"
            value={formatByDate(store.schedules.endEvent, 'YYYY-MM-DDTHH:mm')}
            onChange={e => setStore(s => ({ ...s, schedules: { ...s.schedules, endEvent: new Date(e.target.value).getTime() } }))}/>
        </FormItem>
      </FormSection>

      <h3>チケットタイプ</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>タイプID</th>
            <th style={{ width: '15%' }}>タイプ名</th>
            <th style={{ width: '20%' }}>説明</th>
            <th style={{ width: '10%' }}>価格</th>
            <th style={{ width: '10%' }}>支払いURL</th>
            <th style={{ width: '10%' }}>商品ID</th>
            <th>チケットカラー</th>
            <th>非公開</th>
          </tr>
        </thead>
        <tbody>
          {editableTypes.map((t, i) => <tr key={i}>
            <td>
              <FormInput
                value={t.id}
                onChange={e => handleEditType(
                  i,
                  e.target.value,
                  t.name,
                  t.description,
                  t.price,
                  t.productId,
                  t.paymentURL,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                value={t.name}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  e.target.value,
                  t.description,
                  t.price,
                  t.productId,
                  t.paymentURL,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                value={t.description}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  t.name,
                  e.target.value,
                  t.price,
                  t.productId,
                  t.paymentURL,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                value={t.price}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  t.name,
                  t.description,
                  e.target.value,
                  t.productId,
                  t.paymentURL,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                value={t.paymentURL}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  t.name,
                  t.description,
                  t.price,
                  e.target.value,
                  t.paymentURL,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                value={t.productId}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  t.name,
                  t.description,
                  t.price,
                  t.productId,
                  e.target.value,
                  t.color,
                  t.isPrivate)}/>
            </td>
            <td>
              <FormInput
                type="color"
                value={t.color}
                onChange={e => handleEditType(
                  i,
                  t.id,
                  t.name,
                  t.description,
                  t.price,
                  t.productId,
                  t.paymentURL,
                  e.target.value,
                  t.isPrivate
                )}/>
            </td>
            <td>
              <FormCheckbox
                name={`private-${i}`}
                label="非公開"
                checked={t.isPrivate}
                onChange={checked => handleEditType(
                  i,
                  t.id,
                  t.name,
                  t.description,
                  t.price,
                  t.productId,
                  t.paymentURL,
                  t.color,
                  checked)} />
            </td>
          </tr>)}
        </tbody>
      </table>

      <h3>注意事項</h3>
      <FormSection>
        {store.rules.map((r, i) => <FormItem key={i}>
          <FormLabel>注意事項 {i + 1}</FormLabel>
          <FormInput
            value={r}
            onChange={e => handleEditRule(i, e.target.value)} />
        </FormItem>)}
      </FormSection>

      <h3>申し込み説明</h3>
      <FormSection>
        {store.descriptions.map((d, i) => <FormItem key={i}>
          <FormLabel>申し込み説明 {i + 1}</FormLabel>
          <FormInput
            value={d}
            onChange={e => handleEditDescription(i, e.target.value)}/>
        </FormItem>)}
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton inlined onClick={handleConfirm}>内容確認</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default InformationInput
