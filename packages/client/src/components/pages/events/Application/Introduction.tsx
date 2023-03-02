import FormButton from '../../../Form/Button'
import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'

interface Props {
  nextStep: () => void
}
const Introduction: React.FC<Props> = (props) => {
  return (
    <>
      <h1>申し込みの前に</h1>
      <h2>スペース情報</h2>
      <h2>用意するもの</h2>

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.nextStep()}>申し込みへ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Introduction
