import { useCallback, useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdLocalActivity, MdNewReleases } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import useVoucher from '../../hooks/useVoucher'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseVoucherCodeDocument, SockbaseVoucherDocument, VoucherTargetType } from 'sockbase'

const VoucherListPage: React.FC = () => {
  const { getVoucherCodesAsync, getVoucherAsync, deleteVoucherByCodeAsync } = useVoucher()

  const [voucherCodes, setVoucherCodes] = useState<SockbaseVoucherCodeDocument[]>()
  const [vouchers, setVouchers] = useState<Record<string, SockbaseVoucherDocument>>()

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

  const handleDelete = useCallback(async (voucherCode: string) => {
    if (!confirm('本当に削除しますか？')) return
    deleteVoucherByCodeAsync(voucherCode)
      .then(() => {
        setVoucherCodes(s => s?.filter(s => s.id !== voucherCode))
      })
      .catch(err => {
        alert('削除に失敗しました')
        throw err
      })
  }, [])

  useEffect(() => {
    getVoucherCodesAsync()
      .then(setVoucherCodes)
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    if (!voucherCodes) return
    const voucherIds = [...new Set(voucherCodes.map(v => v.voucherId))]
    Promise.all(voucherIds.map(async id => ({
      id,
      data: await getVoucherAsync(id)
    })))
      .then(result => {
        setVouchers(result.reduce((p, c) => ({ ...p, [c.id]: c.data }), {} as Record<string, SockbaseVoucherDocument>))
      })
      .catch(err => { throw err })
  }, [voucherCodes])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="バウチャー一覧">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdLocalActivity />}
        title="バウチャー一覧" />

      <FormSection>
        <FormItem>
          <LinkButton to="/vouchers/create">
            <IconLabel
              icon={<MdNewReleases />}
              label="バウチャーを作成" />
          </LinkButton>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th>コード</th>
            <th>対象</th>
            <th>対象 ID</th>
            <th>対象タイプ ID</th>
            <th>バウチャー額</th>
            <th>使用回数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {vouchers === undefined && (
            <tr>
              <td colSpan={7}>読み込み中…</td>
            </tr>
          )}
          {vouchers && Object.keys(vouchers).length === 0 && (
            <tr>
              <td colSpan={7}>データがありません</td>
            </tr>
          )}
          {vouchers && voucherCodes?.map(code => {
            const voucher = vouchers[code.voucherId]
            return (
              <tr key={voucher.id}>
                <td><Link to={`/vouchers/${voucher.id}`}><code>{code.id}</code></Link></td>
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
                <td>
                  <FormItem $inlined>
                    <LinkButton to={`/vouchers/${voucher.id}`}>
                      <IconLabel
                        icon={<MdEdit />}
                        label="編集" />
                    </LinkButton>
                    <FormButton onClick={() => handleDelete(code.id)}>
                      <IconLabel
                        icon={<MdDelete />}
                        label="削除" />
                    </FormButton>
                  </FormItem>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default VoucherListPage
