import { useCallback } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import LinkButton from '../../../../components/Parts/LinkButton'

interface Props {
  storeId: string | null | undefined
  init: () => void
}
const Complete: React.FC<Props> = (props) => {
  const handleInitialize = useCallback(() => {
    if (!confirm('新しいチケットストアを作るために入力フォームをリセットします。\nよろしいですか？')) return
    props.init()
    alert('リセットしました')
  }, [props.init])

  return (
    <>
      <h2>チケットストアの作成が完了しました</h2>
      <FormSection>
        <FormItem inlined>
          <LinkButton inlined to={`/dashboard/stores/${props.storeId}`}>チケットストア管理画面を開く</LinkButton>
          <FormButton inlined onClick={handleInitialize} color="default">新しいチケットストアを作成する</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
