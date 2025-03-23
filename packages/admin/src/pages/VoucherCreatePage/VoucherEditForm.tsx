import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdSave } from 'react-icons/md'
import styled from 'styled-components'
import FormButton from '../../components/Form/FormButton'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import FormSelect from '../../components/Form/FormSelect'
import IconLabel from '../../components/Parts/IconLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import { generateRandomCharacters } from '../../helpers/randomHelper'
import useEvent from '../../hooks/useEvent'
import useStore from '../../hooks/useStore'
import type { SockbaseStoreDocument, SockbaseEventDocument, SockbaseVoucherDocument, SockbaseVoucher } from 'sockbase'

interface Props {
  isEditMode?: boolean
  voucherCode?: string
  voucher?: SockbaseVoucherDocument | undefined
  handleSubmit: (voucherCode: string, voucher: SockbaseVoucher) => void
}
const VoucherEditForm: React.FC<Props> = props => {
  const { getEventsAsync } = useEvent()
  const { getStoresAsync } = useStore()

  const [events, setEvents] = useState<SockbaseEventDocument[]>()
  const [stores, setStores] = useState<SockbaseStoreDocument[]>()

  const [voucherCode, setVoucherCode] = useState('')
  const [editableVoucher, setEditableVoucher] = useState({
    targetCategory: '',
    targetDivision: '',
    targetType: '',
    isAllType: false,
    amount: '',
    isFullAmount: false,
    usedCountLimit: '',
    isUnlimited: false
  })

  const targetDivisions = useMemo(() => {
    if (!editableVoucher.targetCategory || !events || !stores) return

    if (editableVoucher.targetCategory === '1') {
      return events?.map(e => ({
        id: e.id,
        name: e.name
      }))
    }
    if (editableVoucher.targetCategory === '2') {
      return stores?.map(s => ({
        id: s.id,
        name: s.name
      }))
    }
  }, [editableVoucher.targetCategory, events, stores])

  const targetDivisionTypes = useMemo(() => {
    if (!editableVoucher.targetDivision || !events || !stores) return

    if (editableVoucher.targetCategory === '1') {
      const event = events?.find(e => e.id === editableVoucher.targetDivision)
      return event?.spaces.map(s => ({
        id: s.id,
        name: `${s.name} (${s.price.toLocaleString()}円)`
      }))
    }
    if (editableVoucher.targetCategory === '2') {
      const store = stores?.find(s => s.id === editableVoucher.targetDivision)
      return store?.types
        .filter(t => t.price > 0)
        .map(t => ({
          id: t.id,
          name: `${t.name} (${t.price.toLocaleString()}円)`
        }))
    }
  }, [editableVoucher, events, stores])

  const handleGenerateVoucherCode = useCallback(() => {
    const digit = 16
    const code = generateRandomCharacters(digit, '0123456789BCDEGHJKLMNPRSTUVXYZ')
    setVoucherCode(code)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!editableVoucher.targetCategory || !editableVoucher.targetDivision) return
    props.handleSubmit(
      voucherCode,
      {
        amount: !editableVoucher.isFullAmount
          ? parseInt(editableVoucher.amount) || 0
          : null,
        targetType: editableVoucher.targetCategory === '1'
          ? 1
          : 2,
        targetId: editableVoucher.targetDivision,
        targetTypeId: !editableVoucher.isAllType && editableVoucher.targetType
          ? editableVoucher.targetType
          : null,
        usedCountLimit: !editableVoucher.isUnlimited
          ? parseInt(editableVoucher.usedCountLimit) || 0
          : null,
        usedCount: 0
      })
  }, [voucherCode, editableVoucher])

  useEffect(() => {
    getEventsAsync()
      .then(setEvents)
      .catch(err => { throw err })
    getStoresAsync()
      .then(setStores)
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    if (props.voucher) {
      setEditableVoucher({
        targetCategory: props.voucher.targetType === 1 ? '1' : '2',
        targetDivision: props.voucher.targetId,
        targetType: props.voucher.targetTypeId || '',
        isAllType: props.voucher.targetTypeId === null,
        amount: props.voucher.amount?.toString() || '',
        isFullAmount: props.voucher.amount === null,
        usedCountLimit: props.voucher.usedCountLimit?.toString() || '',
        isUnlimited: props.voucher.usedCountLimit === null
      })
    }
    if (props.voucherCode) {
      setVoucherCode(props.voucherCode)
    }
  }, [props.voucher, props.voucherCode])

  return (
    <Container>
      <TwoColumnLayout>
        <>
          <FormSection>
            <FormItem>
              <FormLabel>バウチャーコード</FormLabel>
              <FormInput
                disabled={props.isEditMode}
                onChange={e => setVoucherCode(e.target.value)}
                value={voucherCode} />
            </FormItem>
            <FormItem>
              <FormButton
                disabled={props.isEditMode}
                onClick={handleGenerateVoucherCode}>
                自動生成
              </FormButton>
            </FormItem>
            <FormItem>
              <FormLabel>対象</FormLabel>
              <FormSelect
                onChange={e => setEditableVoucher(s => ({ ...s, targetCategory: e.target.value }))}
                value={editableVoucher.targetCategory}>
                <option value="">選択してください</option>
                <option value="1">イベント</option>
                <option value="2">チケットストア</option>
              </FormSelect>
            </FormItem>
            <FormItem>
              <FormLabel>対象区分</FormLabel>
              <FormSelect
                onChange={e => setEditableVoucher(s => ({ ...s, targetDivision: e.target.value }))}
                value={editableVoucher.targetDivision}>
                <option value="">選択してください</option>
                {targetDivisions?.map(d => (
                  <option
                    key={d.id}
                    value={d.id}>
                    {d.name}
                  </option>
                ))}
              </FormSelect>
            </FormItem>
            <FormItem>
              <FormLabel>対象種別</FormLabel>
              <FormCheckbox
                checked={editableVoucher.isAllType}
                label="全種別"
                name="isAllType"
                onChange={c => setEditableVoucher(s => ({ ...s, isAllType: c }))} />
            </FormItem>
            {!editableVoucher.isAllType && (
              <FormItem>
                <FormSelect
                  onChange={e => setEditableVoucher(s => ({ ...s, targetType: e.target.value }))}
                  value={editableVoucher.targetType}>
                  <option value="">選択してください</option>
                  {targetDivisionTypes?.map(d => (
                    <option
                      key={d.id}
                      value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </FormSelect>
              </FormItem>
            )}
            <FormItem>
              <FormLabel>バウチャー額</FormLabel>
              <FormCheckbox
                checked={editableVoucher.isFullAmount}
                label="全額"
                name="isFullAmount"
                onChange={c => setEditableVoucher(s => ({ ...s, isFullAmount: c }))} />
            </FormItem>
            {!editableVoucher.isFullAmount && (
              <FormItem>
                <FormInput
                  onChange={e => setEditableVoucher(s => ({ ...s, amount: e.target.value }))}
                  placeholder="1000"
                  type="number"
                  value={editableVoucher.amount} />
              </FormItem>
            )}
            <FormItem>
              <FormLabel>使用回数制限</FormLabel>
              <FormCheckbox
                checked={editableVoucher.isUnlimited}
                label="無制限"
                name="isUnlimited"
                onChange={c => setEditableVoucher(s => ({ ...s, isUnlimited: c }))} />
            </FormItem>
            {!editableVoucher.isUnlimited && (
              <FormItem>
                <FormInput
                  onChange={e => setEditableVoucher(s => ({ ...s, usedCountLimit: e.target.value }))}
                  placeholder="100"
                  type="number"
                  value={editableVoucher.usedCountLimit} />
              </FormItem>
            )}
          </FormSection>
          <FormSection>
            <FormItem>
              <FormButton onClick={handleSubmit}>
                <IconLabel
                  icon={<MdSave />}
                  label="保存" />
              </FormButton>
            </FormItem>
          </FormSection>
        </>
        <></>
      </TwoColumnLayout>
    </Container>
  )
}

export default VoucherEditForm

const Container = styled.div``
