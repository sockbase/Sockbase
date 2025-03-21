import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SockbaseCheckoutResult } from 'sockbase'
import usePayment from '../../hooks/usePayment'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import RequiredLogin from '../../libs/RequiredLogin'
import StepContainer from './StepContainer/StepContainer'

const CheckoutProcessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getCheckoutSessionAsync } = usePayment()

  const [checkoutResult, setCheckoutResult] = useState<SockbaseCheckoutResult | null>()
  const checkoutSessionId = useMemo(() => searchParams.get('cs'), [searchParams])

  useEffect(() => {
    if (!checkoutSessionId) {
      navigate('/', { replace: true })
      return
    }
    getCheckoutSessionAsync(checkoutSessionId)
      .then(setCheckoutResult)
      .catch(err => { throw err })
  }, [checkoutSessionId])

  return (
    <DefaultBaseLayout>
      <RequiredLogin />
      {checkoutSessionId && <StepContainer checkoutResult={checkoutResult} />}
    </DefaultBaseLayout>
  )
}

export default CheckoutProcessPage
