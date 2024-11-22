import { useCallback, useEffect, useState } from 'react'
import { MdArrowForward, MdUpload } from 'react-icons/md'
import FormButton from '../../../../components/Form/FormButton'
import FormCheckbox from '../../../../components/Form/FormCheckbox'
import FormInput from '../../../../components/Form/FormInput'
import FormItem from '../../../../components/Form/FormItem'
import FormLabel from '../../../../components/Form/FormLabel'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import CircleCutImage from '../../../../components/Parts/CircleCutImage'
import IconLabel from '../../../../components/Parts/IconLabel'
import useApplication from '../../../../hooks/useApplication'
import useDayjs from '../../../../hooks/useDayjs'
import useFile from '../../../../hooks/useFile'
import type { SockbaseApplication, SockbaseApplicationAddedResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  app: SockbaseApplication | undefined
  event: SockbaseEventDocument | null | undefined
  addedResult: SockbaseApplicationAddedResult | undefined
  nextStep: () => void
}
const CircleCut: React.FC<Props> = (props) => {
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
    if (!props.addedResult || !circleCutFile || isLaterUpload) return

    setProgress(true)

    uploadCircleCutFileAsync(props.addedResult.hashId, circleCutFile)
      .then(() => {
        alert('アップロードが完了しました')
        setUploaded(true)
      })
      .catch(err => {
        setProgress(false)
        throw err
      })
  }, [props.addedResult, circleCutFile, isLaterUpload])

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
      <h1>お支払いありがとうございます</h1>
      {props.app?.paymentMethod === 'online'
        ? <p>
        オンライン決済の場合、決済が完了してから 1 日程度で自動的に反映されます。<br />
        3 日経っても反映されない場合は、マイページ内のお問い合わせからご連絡ください。
        </p>
        : props.app?.paymentMethod === 'bankTransfer'
          ? <p>
        銀行振込の場合、お振込みいただいてから 1 週間程度お時間をいただくことがございます。<br />
        1 週間経っても反映されない場合は、マイページ内のお問い合わせからご連絡ください。
          </p>
          : <></>}

      <h1>サークルカットの提出</h1>
      <ul>
        <li>テンプレートを使用し、<u>PNG 形式でのご提出をお願いいたします。</u></li>
        <li>サークルカットの変更は、申し込み後のマイページから行えます。</li>
        <li>公序良俗に反する画像は使用できません。不特定多数の方の閲覧が可能なためご配慮をお願いいたします。</li>
      </ul>

      <Alert type="warning" title="サークルカットの提出は必須です">
        後でアップロードすることも可能ですが、<b>{formatByDate((props.event?.schedules.overviewFixedAt ?? 0) - 1, 'YYYY年 M月 D日')}</b> までにご提出いただくようお願いいたします。
      </Alert>

      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput
            type="file"
            accept="image/png"
            onChange={e => setCircleCutFile(e.target.files?.[0])}
            disabled={isLaterUpload} />
        </FormItem>
        {circleCutData && <FormItem>
          <CircleCutImage src={circleCutData} />
        </FormItem>}
        <FormItem>
          <FormButton
            color="primary"
            onClick={uploadCircleCut}
            disabled={!circleCutData || isProgress || isLaterUpload}>
            <IconLabel icon={<MdUpload />} label="アップロードする" />
          </FormButton>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isLaterUpload"
            label="後でアップロードする"
            onChange={checked => setLaterUpload(checked)}
            checked={isLaterUpload}
            disabled={isProgress || isUploaded} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton
            color="primary"
            onClick={props.nextStep}
            disabled={!isUploaded && !isLaterUpload}>
            <IconLabel icon={<MdArrowForward />} label="次へ進む" />
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default CircleCut
