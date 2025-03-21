import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SockbaseCheckoutResult } from 'sockbase'
import usePayment from '../../hooks/usePayment'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import RequiredLogin from '../../libs/RequiredLogin'
import StepContainer from './StepContainer/StepContainer'

const CheckoutProcessPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getCheckoutSessionAsync } = usePayment()

  const [checkoutResult, setCheckoutResult] = useState<SockbaseCheckoutResult | null>()
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>()

  useEffect(() => {
    const cs = searchParams.get('cs')
    if (!cs && checkoutSessionId === undefined) {
      setCheckoutSessionId(null)
      return
    }
    if (!cs) return
    setCheckoutSessionId(cs)
    setSearchParams()
  }, [searchParams, checkoutSessionId])

  useEffect(() => {
    if (checkoutSessionId === undefined) {
      return
    }
    else if (checkoutSessionId === null) {
      navigate('/', { replace: true })
      return
    }
    getCheckoutSessionAsync(checkoutSessionId)
      .then(setCheckoutResult)
      .catch(err => {
        setCheckoutResult(null)
        throw err
      })
  }, [checkoutSessionId])

  return (
    <DefaultBaseLayout>
      <RequiredLogin />
      {checkoutSessionId && (
        <StepContainer
          checkoutResult={checkoutResult}
          checkoutSessionId={checkoutSessionId} />
      )}
    </DefaultBaseLayout>
  )
}

export default CheckoutProcessPage
