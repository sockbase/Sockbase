import { useCallback, useEffect, useState } from 'react'
import { MdArrowForward, MdUpload } from 'react-icons/md'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useFile from '../../hooks/useFile'
import FormButton from '../Form/FormButton'
import FormCheckbox from '../Form/FormCheckbox'
import FormInput from '../Form/FormInput'
import FormItem from '../Form/FormItem'
import FormLabel from '../Form/FormLabel'
import FormSection from '../Form/FormSection'
import Alert from '../Parts/Alert'
import CircleCutImage from '../Parts/CircleCutImage'
import IconLabel from '../Parts/IconLabel'
import type { SockbaseEventDocument } from 'sockbase'

interface Props {
  event: SockbaseEventDocument | null | undefined
  hashId: string | undefined
  nextStep: () => void
}
const CircleCutUploadForm: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()
  const {
    data: circleCutDataWithHook,
    openAsDataURL: openCircleCut
  } = useFile()
  const { uploadCircleCutFileAsync } = useApplication()

  const [circleCutFile, setCircleCutFile] = useState<File | null>()
  const [circleCutData, setCircleCutData] = useState<string>()

  const [isLaterUpload, setLaterUpload] = useState(false)
  const [isProgress, setProgress] = useState(false)
  const [isUploaded, setUploaded] = useState(false)

  const uploadCircleCut = useCallback(() => {
    if (!props.hashId || !circleCutFile || isLaterUpload) return

    setProgress(true)

    uploadCircleCutFileAsync(props.hashId, circleCutFile)
      .then(() => {
        alert('アップロードが完了しました')
        setUploaded(true)
      })
      .catch(err => {
        setProgress(false)
        throw err
      })
  }, [props.hashId, circleCutFile, isLaterUpload])

  useEffect(() => {
    if (!circleCutFile) return
    openCircleCut(circleCutFile)
  }, [circleCutFile])

  useEffect(() => {
    if (!circleCutDataWithHook) return
    setCircleCutData(circleCutDataWithHook)
  }, [circleCutDataWithHook])

  return (
    <>
      <h1>サークルカットの提出</h1>
      <ul>
        <li>テンプレートを使用し、<u>PNG 形式でのご提出をお願いいたします。</u></li>
        <li>サークルカットの変更は、申し込み後のマイページから行えます。</li>
        <li>公序良俗に反する画像は使用できません。不特定多数の方の閲覧が可能なためご配慮をお願いいたします。</li>
      </ul>

      <Alert
        title="サークルカットの提出は必須です"
        type="warning">
        後でアップロードすることも可能ですが、<b>{formatByDate((props.event?.schedules.overviewFixedAt ?? 0) - 1, 'YYYY年 M月 D日')}</b> までにご提出いただくようお願いいたします。
      </Alert>

      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput
            accept="image/png"
            disabled={isLaterUpload}
            onChange={e => setCircleCutFile(e.target.files?.[0])}
            type="file" />
        </FormItem>
        {circleCutData && (
          <FormItem>
            <CircleCutImage src={circleCutData} />
          </FormItem>
        )}
        <FormItem>
          <FormButton
            color="primary"
            disabled={!circleCutData || isProgress || isLaterUpload}
            onClick={uploadCircleCut}>
            <IconLabel
              icon={<MdUpload />}
              label="アップロードする" />
          </FormButton>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormCheckbox
            checked={isLaterUpload}
            disabled={isProgress || isUploaded}
            label="後でアップロードする"
            name="isLaterUpload"
            onChange={checked => setLaterUpload(checked)} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton
            color="primary"
            disabled={!isUploaded && !isLaterUpload}
            onClick={props.nextStep}>
            <IconLabel
              icon={<MdArrowForward />}
              label="次へ進む" />
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default CircleCutUploadForm
