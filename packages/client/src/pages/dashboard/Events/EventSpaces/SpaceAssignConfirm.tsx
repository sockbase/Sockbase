import { useState } from 'react'
import { type SockbaseApplicationDocument, type SockbaseSpaceDocument } from 'sockbase'
import { type RawAssignEventSpace } from '../../../../@types'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import LoadingCircleWrapper from '../../../../components/Parts/LoadingCircleWrapper'

interface Props {
  spacesData: SockbaseSpaceDocument[]
  rawAssignSpaces: RawAssignEventSpace[]
  apps: Record<string, SockbaseApplicationDocument>
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

  const getSpaceData = (spaceId: string): SockbaseSpaceDocument | null => {
    const spaces = props.spacesData.filter(s => s.id === spaceId)
    if (spaces.length === 1) return spaces[0]
    return null
  }

  const getApplication = (applicationHashId: string): SockbaseApplicationDocument | null => {
    const apps = Object.values(props.apps).filter(a => a.hashId === applicationHashId)
    if (apps.length === 1) return apps[0]
    return null
  }

  return (
    <>
      <h2>STEP2: スペース配置データ 確認</h2>
      <table>
        <thead>
          <tr>
            <th>スペースID</th>
            <th>スペース名</th>
            <th>サークルID</th>
            <th>サークル名</th>
          </tr>
        </thead>
        <tbody>
          {props.rawAssignSpaces.map((s, i) => <tr key={i}>
            <td>{s.spaceId}</td>
            <td>{getSpaceData(s.spaceId)?.spaceName ?? 'エラー！'}</td>
            <td>{s.applicationHashId}</td>
            <td>{getApplication(s.applicationHashId)?.circle.name ?? 'エラー！'}</td>
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
