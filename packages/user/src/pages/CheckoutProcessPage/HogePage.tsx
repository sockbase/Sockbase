import { useCallback, useState } from 'react'
import { SockbaseCheckoutRequest } from 'sockbase'
import usePayment from '../../hooks/usePayment'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'

const HogePage: React.FC = () => {
  const { hoge } = usePayment()

  const [data, setData] = useState<SockbaseCheckoutRequest>()

  const handleClick = useCallback(() => {
    hoge()
      .then(setData)
      .catch(err => {
        throw err
      })
  }, [])

  return (
    <DefaultBaseLayout>
      <button onClick={handleClick}>決済処理を開始</button>
      <p>
        {data?.checkoutURL && <a href={data.checkoutURL}>決済</a>}
      </p>

    </DefaultBaseLayout>
  )
}

export default HogePage
