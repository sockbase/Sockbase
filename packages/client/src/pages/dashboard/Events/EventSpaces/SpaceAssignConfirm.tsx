import { useState } from 'react'
import { type SockbaseSpaceDocument } from 'sockbase'
import { type RawAssignEventSpace } from '../../../../@types'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import LoadingCircleWrapper from '../../../../components/Parts/LoadingCircleWrapper'

interface Props {
  spacesData: SockbaseSpaceDocument[]
  rawAssignSpaces: RawAssignEventSpace[]
  handleSubmit: () => Promise<void>
  nextStep: () => void
  prevStep: () => void
}
const SpaceAssignConfirm: React.FC<Props> = (props) => {
  const [isProgress, setProgress] = useState(false)

  const handleSubmit = (): void => {
    setProgress(true)

    props.handleSubmit()
      .then(() => {
        alert('送信しました')
        props.nextStep()
      })
      .catch(err => {
        setProgress(false)
        throw err
      })
  }

  const getSpaceData = (spaceId: string): SockbaseSpaceDocument =>
    props.spacesData.filter(s => s.id === spaceId)[0]

  return (
    <>
      <h2>STEP2: スペース配置データ 確認</h2>
      <table>
        <thead>
          <tr>
            <th>グループ順序</th>
            <th>グループ内順序</th>
            <th>スペース名</th>
          </tr>
        </thead>
        <tbody>
          {props.rawAssignSpaces.map((s, i) => <tr key={i}>
            <td>{s.spaceId}</td>
            <td>{getSpaceData(s.spaceId).spaceName}</td>
            <td>{s.applicationHashId}</td>
          </tr>)}
        </tbody>
      </table>
      <FormSection>
        <FormItem>
          <FormButton
            color="default"
            onClick={props.prevStep}
            disabled={isProgress}>
            修正する
          </FormButton>
        </FormItem>
        <FormItem>
          <LoadingCircleWrapper isLoading={isProgress}>
            <FormButton
              onClick={handleSubmit}
              disabled={isProgress}>
              送信
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>
    </>
  )
}

export default SpaceAssignConfirm
