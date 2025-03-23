import { useCallback } from 'react'
import { MdLocalActivity } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { SockbaseVoucher } from 'sockbase'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useVoucher from '../../hooks/useVoucher'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import VoucherEditForm from './VoucherEditForm'

const VoucherCreatePage: React.FC = () => {
  const { createVoucherAsync } = useVoucher()

  const handleSubmit = useCallback((voucherCode: string, voucher: SockbaseVoucher) => {
    if (!voucherCode) return
    createVoucherAsync(voucherCode, voucher)
      .then(() => alert('バウチャーを作成しました'))
      .catch(err => {
        alert('バウチャーの作成に失敗しました')
        throw err
      })
  }, [])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="バウチャー作成">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/vouchers">バウチャー一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdLocalActivity />}
        title="バウチャー作成" />

      <VoucherEditForm handleSubmit={handleSubmit} />
    </DefaultLayout>
  )
}

export default VoucherCreatePage
