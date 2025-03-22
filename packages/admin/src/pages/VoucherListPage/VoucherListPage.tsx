import { useCallback, useEffect, useState } from 'react'
import { MdLocalActivity } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { SockbaseVoucherDocument, VoucherTargetType } from 'sockbase'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useVoucher from '../../hooks/useVoucher'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const VoucherListPage: React.FC = () => {
  const { getVouchersAsync } = useVoucher()

  const [vouchers, setVouchers] = useState<SockbaseVoucherDocument[]>()

  const getTargetType = useCallback((targetType: VoucherTargetType) => {
    switch (targetType) {
      case 1:
        return 'イベント'
      case 2:
        return 'チケットストア'
      default:
        return '不明'
    }
  }, [])

  useEffect(() => {
    getVouchersAsync()
      .then(setVouchers)
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout title="バウチャー一覧">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdLocalActivity />}
        title="バウチャー一覧" />

      <table>
        <thead>
          <tr>
            <th>コード</th>
            <th>対象</th>
            <th>対象 ID</th>
            <th>対象タイプ ID</th>
            <th>バウチャー額</th>
            <th>使用回数</th>
          </tr>
        </thead>
        <tbody>
          {vouchers === undefined && (
            <tr>
              <td colSpan={6}>読み込み中...</td>
            </tr>
          )}
          {vouchers?.length === 0 && (
            <tr>
              <td colSpan={6}>データがありません</td>
            </tr>
          )}
          {vouchers?.map(voucher => (
            <tr key={voucher.id}>
              <td><code>{voucher.voucherCode}</code></td>
              <td>{getTargetType(voucher.targetType)}</td>
              <td>{voucher.targetId}</td>
              <td>{voucher.targetTypeId ?? '(全てのタイプ)'}</td>
              <td>{voucher.amount ? `${voucher.amount?.toLocaleString()}円` : '全額'}</td>
              <td>
                {
                  voucher.usedCountLimit !== null
                    ? `${voucher.usedCount} / ${voucher.usedCountLimit}`
                    : voucher.usedCount
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default VoucherListPage
