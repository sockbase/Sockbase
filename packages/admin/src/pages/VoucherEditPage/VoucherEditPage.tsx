import { useCallback, useEffect, useState } from 'react'
import { MdLocalActivity } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { SockbaseVoucher, SockbaseVoucherCodeDocument, SockbaseVoucherDocument } from 'sockbase'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useVoucher from '../../hooks/useVoucher'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import VoucherEditForm from '../VoucherCreatePage/VoucherEditForm'

const VoucherEditPage: React.FC = () => {
  const { voucherId } = useParams<{ voucherId: string }>()

  const { getVoucherCodeByIdAsync, getVoucherAsync, updateVoucherAsync } = useVoucher()

  const [voucherCode, setVoucherCode] = useState<SockbaseVoucherCodeDocument>()
  const [voucher, setVoucher] = useState<SockbaseVoucherDocument>()

  const handleSubmit = useCallback((_: string, voucher: SockbaseVoucher) => {
    if (!voucherId) return
    updateVoucherAsync(voucherId, voucher)
      .then(() => alert('バウチャーを更新しました'))
      .catch(err => {
        alert('バウチャーの更新に失敗しました')
        throw err
      })
  }, [voucherId])

  useEffect(() => {
    if (!voucherId) return
    getVoucherCodeByIdAsync(voucherId)
      .then(setVoucherCode)
      .catch(err => { throw err })
    getVoucherAsync(voucherId)
      .then(setVoucher)
      .catch(err => { throw err })
  }, [voucherId])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="バウチャー編集">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/vouchers">バウチャー一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdLocalActivity />}
        title="バウチャー編集" />

      <VoucherEditForm
        handleSubmit={handleSubmit}
        isEditMode={true}
        voucher={voucher}
        voucherCode={voucherCode?.id} />
    </DefaultLayout>
  )
}

export default VoucherEditPage
