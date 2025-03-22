import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import LoadingCircleContainer from '../../components/Parts/LoadingCircleContainer'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../hooks/useApplication'
import useError from '../../hooks/useError'
import useEvent from '../../hooks/useEvent'
import usePayment from '../../hooks/usePayment'
import useStore from '../../hooks/useStore'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import type { SockbaseCheckoutRequest, SockbasePaymentDocument, SockbasePaymentHashDocument } from 'sockbase'

const PayPage: React.FC = () => {
  const { hashId } = useParams<{ hashId: string }>()

  const { getPaymentHashAsync, getPaymentAsync, refreshCheckoutSessionAsync } = usePayment()
  const { getApplicationByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getTicketByIdAsync, getStoreByIdAsync } = useStore()
  const { convertErrorMessage } = useError()

  const [paymentHash, setPaymentHash] = useState<SockbasePaymentHashDocument | null>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [targetName, setTargetName] = useState<string>()
  const [checkoutRequest, setCheckoutRequest] = useState<SockbaseCheckoutRequest | null>()
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    if (!hashId) return
    getPaymentHashAsync(hashId)
      .then(setPaymentHash)
      .catch(err => {
        setPaymentHash(null)
        setPayment(null)
        throw err
      })
  }, [hashId])

  useEffect(() => {
    if (!paymentHash) return
    getPaymentAsync(paymentHash.paymentId)
      .then(setPayment)
      .catch(err => {
        setPayment(null)
        throw err
      })
  }, [paymentHash])

  useEffect(() => {
    if (!payment) return
    if (payment.applicationId) {
      getApplicationByIdAsync(payment.applicationId)
        .then(app => {
          getEventByIdAsync(app.eventId)
            .then(event => setTargetName(event.name))
            .catch(err => { throw err })
        })
        .catch(err => { throw err })
    }
    else if (payment.ticketId) {
      getTicketByIdAsync(payment.ticketId)
        .then(ticket => getStoreByIdAsync(ticket.storeId)
          .then(store => {
            const type = store.types.find(type => type.id === ticket.typeId)
            setTargetName(type!.name)
          })
          .catch(err => { throw err })
        )
        .catch(err => { throw err })
    }
  }, [payment])

  useEffect(() => {
    if (payment?.status !== 0) return
    refreshCheckoutSessionAsync(payment.id)
      .then(setCheckoutRequest)
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        setCheckoutRequest(null)
        throw err
      })
  }, [payment])

  return (
    <DefaultBaseLayout title="お支払い">
      {payment === undefined && (
        <LoadingCircleContainer>
          決済情報を読み込み中です。<br />
          今しばらくお待ちください。
        </LoadingCircleContainer>
      )}
      {paymentHash === null && (
        <Alert
          title="URL が無効です"
          type="error">
          この URL は無効です。お手数ですが、正しい URL をご利用ください。
        </Alert>
      )}
      {payment && (
        <>
          <h1>{targetName ? `${targetName} お支払いページ` : <BlinkField />}</h1>
          {payment.status !== 0 && (
            <Alert
              title="お支払いいただく必要はありません。"
              type="info" />
          )}
          {payment.status === 0 && (
            <>
              <p>
                このページでは、以下の内容についてお支払いを行います。
              </p>
              <table>
                <tbody>
                  <tr>
                    <th>お支払い先</th>
                    <td>{targetName || <BlinkField />}</td>
                  </tr>
                  <tr>
                    <th>お支払い金額</th>
                    <td>{payment.paymentAmount.toLocaleString()} 円</td>
                  </tr>
                  <tr>
                    <th>お支払い ID</th>
                    <td>{payment.hashId}</td>
                  </tr>
                </tbody>
              </table>
              <FormSection>
                <FormItem>
                  <LoadingCircleWrapper
                    inlined
                    isLoading={checkoutRequest === undefined}>
                    <AnchorButton
                      color="primary"
                      disabled={!checkoutRequest}
                      href={checkoutRequest?.checkoutURL}>
                      お支払いを行う
                    </AnchorButton>
                  </LoadingCircleWrapper>
                </FormItem>
              </FormSection>
              {checkoutRequest === undefined && (
                <Alert
                  title="現在お支払いリンクを作成しています。今しばらくお待ちください。"
                  type="info" />
              )}
              {errorMessage && (
                <Alert
                  title="エラーが発生しました"
                  type="error">
                  {errorMessage}
                </Alert>
              )}
            </>
          )}
        </>
      )}
    </DefaultBaseLayout>
  )
}

export default PayPage
