import { useEffect, useState } from 'react'
import { type SockbaseSpaceDocument } from 'sockbase'
import { type RawAssignEventSpace } from '../../../@types'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormLabel from '../../../components/Form/Label'
import FormTextarea from '../../../components/Form/Textarea'
import TwoColumnsLayout from '../../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'

interface Props {
  spacesData: SockbaseSpaceDocument[]
  rawAssignSpaces: RawAssignEventSpace[]
  nextStep: (spaces: RawAssignEventSpace[]) => void
}
const SpaceAssign: React.FC<Props> = (props) => {
  const [rawSpaceAssignData, setRawSpaceAssignData] = useState('')

  const onInitialize = (): void => {
    if (props.rawAssignSpaces.length === 0) return
    setRawSpaceAssignData(
      props.rawAssignSpaces
        .map(s => `${s.applicationHashId},${s.spaceId}`)
        .join('\n')
    )
  }
  useEffect(onInitialize, [props.rawAssignSpaces])

  const handleSubmit = (): void => {
    if (!rawSpaceAssignData) return
    const rawAssignSpaces = rawSpaceAssignData.split('\n')
      .map<RawAssignEventSpace>(space => {
      const meta = space.split(',')
      return {
        spaceId: meta[1],
        applicationHashId: meta[0]
      }
    })
    props.nextStep(rawAssignSpaces)
  }

  return (
    <>
      <TwoColumnsLayout>
        <>
          <h2>STEP2: スペース配置作成</h2>
          <FormSection>
            <FormItem>
              <FormLabel>スペース配置データ</FormLabel>
              <FormTextarea value={rawSpaceAssignData} onChange={e => setRawSpaceAssignData(e.target.value)} />
            </FormItem>
            <FormItem>
              <FormButton
                inlined
                onClick={handleSubmit}>
                確認へ進む
              </FormButton>
            </FormItem>
          </FormSection>
        </>
        <>
          <h3>スペースデータ</h3>
          <table>
            <thead>
              <tr>
                <th>スペース名</th>
                <th>スペースID</th>
                <th>グループ順序</th>
                <th>グループ内順序</th>
              </tr>
            </thead>
            <tbody>
              {props.spacesData.map(space => <tr key={space.id}>
                <td>{space.spaceName}</td>
                <td>{space.id} <CopyToClipboard content={space.id} /></td>
                <td>{space.spaceGroupOrder}</td>
                <td>{space.spaceOrder}</td>
              </tr>)}
            </tbody>
          </table>
        </>
      </TwoColumnsLayout>
    </>
  )
}

export default SpaceAssign
