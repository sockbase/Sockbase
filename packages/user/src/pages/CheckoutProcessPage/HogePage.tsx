import { useCallback } from 'react'
import usePayment from '../../hooks/usePayment'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'

const HogePage: React.FC = () => {
  const { hoge } = usePayment()

  const handleClick = useCallback(() => {
    hoge()
      .then(data => console.log(data))
      .catch(err => {
        throw err
      })
  }, [])

  return (
    <DefaultBaseLayout>
      <button onClick={handleClick}>決済処理を開始</button>
    </DefaultBaseLayout>
  )
}

export default HogePage
