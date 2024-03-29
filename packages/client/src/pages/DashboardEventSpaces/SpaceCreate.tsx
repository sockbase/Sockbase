import { useEffect, useState } from 'react'
import { type RawEventSpace } from '../../@types'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormLabel from '../../components/Form/Label'
import FormTextarea from '../../components/Form/Textarea'

interface Props {
  rawSpaces: RawEventSpace[]
  nextStep: (rawSpaces: RawEventSpace[]) => void
}
const SpaceCreate: React.FC<Props> = (props) => {
  const [rawSpaceData, setRawSpaceData] = useState('')

  const onInitialize = (): void => {
    if (props.rawSpaces.length === 0) return
    setRawSpaceData(
      props.rawSpaces
        .map(space => `${space.spaceGroupOrder},${space.spaceOrder},${space.spaceName}`)
        .join('\n')
    )
  }
  useEffect(onInitialize, [props.rawSpaces])

  const handleSubmit = (): void => {
    const rawSpaces = rawSpaceData.split('\n')
      .map<RawEventSpace>(space => {
      const meta = space.split(',')
      return {
        spaceGroupOrder: Number(meta[0]),
        spaceOrder: Number(meta[1]),
        spaceName: meta[2]
      }
    })
    props.nextStep(rawSpaces)
  }

  return (
    <>
      <h2>STEP1: スペースデータ作成</h2>
      <p>
        <code>ブロック順序,スペース順序,スペース名</code> の形式で入力してください
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>スペースデータ</FormLabel>
          <FormTextarea value={rawSpaceData} onChange={e => setRawSpaceData(e.target.value)} />
        </FormItem>
        <FormItem>
          <FormButton
            onClick={handleSubmit}
            inlined={true}
            disabled={!rawSpaceData}>
            確認へ進む
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default SpaceCreate
