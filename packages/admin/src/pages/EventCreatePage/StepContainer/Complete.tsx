import { useCallback } from 'react'
import FormButton from '../../../components/Form/FormButton'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import LinkButton from '../../../components/Parts/LinkButton'
interface Props {
  eventId: string | null | undefined
  init: () => void
}
const Complete: React.FC<Props> = props => {
  const handleInitialize = useCallback(() => {
    if (!confirm('新しいイベントを作るために入力フォームをリセットします。\nよろしいですか？')) return
    props.init()
  }, [props.init])

  return (
    <>
      <h2>イベントの作成が完了しました</h2>
      <FormSection>
        <FormItem $inlined>
          <LinkButton to={`/events/${props.eventId}`}>イベント管理画面を開く</LinkButton>
          <FormButton
            color="default"
            onClick={handleInitialize}>新しいイベントを作成する
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
