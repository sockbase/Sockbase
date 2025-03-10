import { useCallback, useEffect, useState } from 'react'
import { type SockbaseStore } from 'sockbase'
import useStore from '../../../hooks/useStore'
import Complete from './Complete'
import InformationConfirm from './InformationConfirm'
import InformationInput from './InformationInput'

const StepContainer: React.FC = () => {
  const { createStoreAsync } = useStore()

  const [stepComponentes, setStepComponentes] = useState<JSX.Element[]>()
  const [step, setStep] = useState(0)

  const [storeId, setStoreId] = useState<string | null>()
  const [store, setStore] = useState<SockbaseStore | null>()

  const handleCreateAsync = useCallback(async (): Promise<void> => {
    if (!storeId || !store) {
      throw new Error('storeId or store is undefined')
    }
    await createStoreAsync(storeId, store)
      .catch(err => { throw err })
  }, [storeId, store])

  const handleInitialize = useCallback(() => {
    setStep(0)
    setStoreId(null)
    setStore(null)
  }, [setStep, setStoreId, setStore])

  useEffect(() => {
    setStepComponentes([
      <InformationInput
        key="information-input"
        nextStep={(storeId: string, store: SockbaseStore) => {
          setStoreId(storeId)
          setStore(store)
          setStep(1)
        }}
        store={store}
        storeId={storeId} />,
      <InformationConfirm
        handleCreateAsync={handleCreateAsync}
        key="information-confirm"
        nextStep={() => setStep(2)}
        prevStep={() => setStep(0)}
        store={store}
        storeId={storeId} />,
      <Complete
        init={handleInitialize}
        key="complete"
        storeId={storeId} />
    ])
  }, [storeId, store, handleCreateAsync])

  return (
    <>
      {stepComponentes?.[step]}
    </>
  )
}

export default StepContainer
