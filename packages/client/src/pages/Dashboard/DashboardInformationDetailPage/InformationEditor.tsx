import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import FormTextarea from '../../../components/Form/Textarea'
import useDayjs from '../../../hooks/useDayjs'
import useInformation from '../../../hooks/useInformation'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type { SockbaseInformationDocument } from 'sockbase'

interface Props {
  information?: SockbaseInformationDocument | undefined
  isNewInformation?: boolean
  handleChange: (information: SockbaseInformationDocument) => void
}
const InformationEditor: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  const { deleteInformationAsync } = useInformation()

  const [editableInformation, setEditableInformation] = useState({
    id: '',
    title: '',
    body: '',
    isPublished: false,
    updatedAt: formatByDate(new Date(), 'YYYY-MM-DD')
  })

  const handleChange = useCallback(() => {
    const sanitizedInformation = {
      ...editableInformation,
      body: editableInformation.body.replaceAll('\n', '\\n'),
      updatedAt: new Date(editableInformation.updatedAt).getTime()
    }
    props.handleChange(sanitizedInformation)
  }, [editableInformation])

  const handleDelete = useCallback(() => {
    if (!props.information) return
    if (!confirm(`お知らせ「${props.information.title}」を削除します。\nよろしいですか？`)) return
    deleteInformationAsync(props.information.id)
      .then(() => alert('削除しました'))
      .catch(err => { throw err })
  }, [props.information])

  useEffect(() => {
    if (!props.information) return
    setEditableInformation({
      ...props.information,
      body: props.information.body.replaceAll('\\n', '\n'),
      updatedAt: formatByDate(props.information.updatedAt, 'YYYY-MM-DD')
    })
  }, [props.information])

  return (
    <TwoColumnsLayout>
      <>
        <FormSection>
          <FormItem>
            <FormCheckbox
              name="isPublished"
              label="公開"
              checked={editableInformation?.isPublished}
              onChange={checked => setEditableInformation(s => ({ ...s, isPublished: checked }))}
              disabled={!props.isNewInformation && !props.information} />
          </FormItem>
          <FormItem>
            <FormLabel>更新日</FormLabel>
            <FormInput
              type="date"
              value={editableInformation?.updatedAt}
              onChange={e => setEditableInformation(s => ({ ...s, updatedAt: e.target.value }))}
              disabled={!props.isNewInformation && !props.information} />
          </FormItem>
          <FormItem>
            <FormLabel>タイトル</FormLabel>
            <FormInput
              value={editableInformation?.title}
              onChange={e => setEditableInformation(s => ({ ...s, title: e.target.value }))}
              disabled={!props.isNewInformation && !props.information} />
          </FormItem>
          <FormItem>
            <FormLabel>内容</FormLabel>
            <FormTextarea
              value={editableInformation?.body}
              onChange={e => setEditableInformation(s => ({ ...s, body: e.target.value }))}
              style={{ height: '20em' }} />
          </FormItem>
        </FormSection>
      </>
      <>
        <h3>プレビュー</h3>
        <h1>{editableInformation.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {editableInformation?.body}
        </ReactMarkdown>

        <h3>操作</h3>
        <FormSection>
          <FormItem>
            <FormButton onClick={handleChange}>
              {props.isNewInformation ? '作成' : '更新'}
            </FormButton>
          </FormItem>
          <FormItem>
            {!props.isNewInformation && <FormButton onClick={handleDelete} color="danger">
              削除
            </FormButton>}
          </FormItem>
        </FormSection>
      </>
    </TwoColumnsLayout>
  )
}

export default InformationEditor
