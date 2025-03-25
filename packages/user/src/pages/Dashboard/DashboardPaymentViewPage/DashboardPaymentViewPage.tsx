import { useEffect, useState } from 'react'
import { MdPayment, MdReceiptLong } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import AnchorButton from '../../../components/Parts/AnchorButton'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import usePayment from '../../../hooks/usePayment'
import useStore from '../../../hooks/useStore'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type { SockbasePaymentHashDocument, SockbasePaymentDocument } from 'sockbase'

const DashboardPaymentViewPage: React.FC = () => {
  const { hashId } = useParams<{ hashId: string }>()

  const { getPaymentHashAsync, getPaymentAsync } = usePayment()
  const { getApplicationByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getTicketByIdAsync, getStoreByIdAsync } = useStore()
  const { formatByDate } = useDayjs()

  const [paymentHash, setPaymentHash] = useState<SockbasePaymentHashDocument>()
  const [payment, setPayment] = useState<SockbasePaymentDocument>()

  const [targetType, setTargetType] = useState<'applications' | 'tickets'>()
  const [targetName, setTargetName] = useState<string>()
  const [targetId, setTargetId] = useState<string>()

  useEffect(() => {
    if (!hashId) return
    getPaymentHashAsync(hashId)
      .then(setPaymentHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!paymentHash) return
    getPaymentAsync(paymentHash.paymentId)
      .then(setPayment)
      .catch(err => { throw err })
  }, [paymentHash])

  useEffect(() => {
    if (!payment) return
    if (payment.applicationId) {
      setTargetType('applications')
      getApplicationByIdAsync(payment.applicationId)
        .then(app => {
          setTargetId(app.hashId ?? '')
          getEventByIdAsync(app.eventId)
            .then(event => {
              setTargetName(event.name)
            })
        }
        )
    }
    else if (payment.ticketId) {
      setTargetType('tickets')
      getTicketByIdAsync(payment.ticketId)
        .then(ticket => {
          if (!ticket) return
          setTargetId(ticket.hashId ?? '')
          getStoreByIdAsync(ticket.storeId)
            .then(store => {
              const type = store.types.find(t => t.id === ticket.typeId)
              setTargetName(`${store.name} (${type!.name})`)
            })
        }
        )
    }
  }, [payment])

  return (
    <DashboardBaseLayout title="決済詳細情報">
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
        <li><Link to="/dashboard/payments">決済履歴</Link></li>
      </Breadcrumbs>

      <PageTitle
        description="お支払いの詳細情報を確認できます"
        icon={<MdPayment />}
        isLoading={!targetName}
        title={targetName} />

      <FormSection>
        <FormItem>
          <AnchorButton
            disabled={payment?.status !== 1}
            href={`/dashboard/payments/${hashId}/receipt`}>
            <IconLabel
              icon={<MdReceiptLong />}
              label="領収書を表示" />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <TwoColumnsLayout>
        <>
          <h3>お支払い情報</h3>
          <table>
            <tbody>
              <tr>
                <th>ステータス</th>
                <td>
                  {
                    payment
                      ? <PaymentStatusLabel payment={payment} />
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>決済金額</th>
                <td>
                  {
                    payment
                      ? `${payment.paymentAmount.toLocaleString()}円`
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>バウチャー利用金額</th>
                <td>
                  {
                    payment
                      ? `${payment.voucherAmount.toLocaleString()}円`
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>決済依頼日時</th>
                <td>
                  {
                    payment
                      ? payment.createdAt ? formatByDate(payment.createdAt) : '---'
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>更新日時</th>
                <td>
                  {
                    payment
                      ? payment.updatedAt ? formatByDate(payment.updatedAt) : '---'
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>決済日時</th>
                <td>
                  {
                    payment
                      ? payment.purchasedAt ? formatByDate(payment.purchasedAt) : '---'
                      : <BlinkField />
                  }
                </td>
              </tr>
              <tr>
                <th>補助番号</th>
                <td>
                  {
                    payment
                      ? payment.bankTransferCode
                      : <BlinkField />
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>お支払い先情報</h3>
          <table>
            <tbody>
              <tr>
                <th>お支払い先</th>
                <td>
                  <Link to={`/dashboard/${targetType}/${targetId}`}>{targetName ?? <BlinkField />}</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardPaymentViewPage
