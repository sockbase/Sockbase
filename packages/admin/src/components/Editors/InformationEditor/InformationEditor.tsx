import { useState, useCallback, useEffect } from 'react'
import { MdDelete, MdSave, MdSaveAs } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useDayjs from '../../../hooks/useDayjs'
import useInformation from '../../../hooks/useInformation'
import FormButton from '../../Form/FormButton'
import FormCheckbox from '../../Form/FormCheckbox'
import FormInput from '../../Form/FormInput'
import FormItem from '../../Form/FormItem'
import FormLabel from '../../Form/FormLabel'
import FormSection from '../../Form/FormSection'
import FormTextarea from '../../Form/FormTextarea'
import IconLabel from '../../Parts/IconLabel'
import TwoColumnLayout from '../../TwoColumnLayout'
import type { SockbaseInformationDocument } from 'sockbase'

interface Props {
  information?: SockbaseInformationDocument | undefined
  isNewInformation?: boolean
  handleChange: (information: SockbaseInformationDocument) => void
}

const InformationEditor: React.FC<Props> = props => {
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
    <TwoColumnLayout>
      <>
        <FormSection>
          <FormItem>
            <FormCheckbox
              checked={editableInformation?.isPublished}
              disabled={!props.isNewInformation && !props.information}
              label="公開"
              name="isPublished"
              onChange={checked => setEditableInformation(s => ({ ...s, isPublished: checked }))} />
          </FormItem>
          <FormItem>
            <FormLabel>更新日</FormLabel>
            <FormInput
              disabled={!props.isNewInformation && !props.information}
              onChange={e => setEditableInformation(s => ({ ...s, updatedAt: e.target.value }))}
              type="date"
              value={editableInformation?.updatedAt} />
          </FormItem>
          <FormItem>
            <FormLabel>タイトル</FormLabel>
            <FormInput
              disabled={!props.isNewInformation && !props.information}
              onChange={e => setEditableInformation(s => ({ ...s, title: e.target.value }))}
              value={editableInformation?.title} />
          </FormItem>
          <FormItem>
            <FormLabel>内容</FormLabel>
            <FormTextarea
              onChange={e => setEditableInformation(s => ({ ...s, body: e.target.value }))}
              style={{ height: '20em' }}
              value={editableInformation?.body} />
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
          <FormItem $inlined>
            <FormButton onClick={handleChange}>
              {
                props.isNewInformation
                  ? (
                    <IconLabel
                      icon={<MdSave />}
                      label="作成" />
                  )
                  : (
                    <IconLabel
                      icon={<MdSaveAs />}
                      label="更新" />
                  )
              }
            </FormButton>
            {!props.isNewInformation && (
              <FormButton
                color="danger"
                onClick={handleDelete}>
                <IconLabel
                  icon={<MdDelete />}
                  label="削除" />
              </FormButton>
            )}
          </FormItem>
        </FormSection>
      </>
    </TwoColumnLayout>
  )
}

export default InformationEditor
