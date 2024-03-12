import { useState } from 'react'
import { type RawEventSpace } from '../../@types'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'

interface Props {
  rawSpaces: RawEventSpace[]
  createSpaces: () => Promise<void>
  nextStep: () => void
  prevStep: () => void
}
const SpaceCreateConfirm: React.FC<Props> = (props) => {
  const [isProgress, setProgress] = useState(false)

  const handleSubmit = (): void => {
    setProgress(true)

    props.createSpaces()
      .then(() => {
        alert('作成しました')
        props.nextStep()
      })
      .catch(err => {
        setProgress(false)
        throw err
      })
  }

  return (
    <>
      <h2>STEP1: スペースデータ追加 確認</h2>
      <table>
        <thead>
          <tr>
            <th>グループ順序</th>
            <th>グループ内順序</th>
            <th>スペース名</th>
          </tr>
        </thead>
        <tbody>
          {props.rawSpaces.map((s, i) => <tr key={i}>
            <td>{s.spaceGroupOrder}</td>
            <td>{s.spaceOrder}</td>
            <td>{s.spaceName}</td>
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

export default SpaceCreateConfirm
