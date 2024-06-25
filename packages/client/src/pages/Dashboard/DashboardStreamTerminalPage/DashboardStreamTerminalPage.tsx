import { useCallback, useEffect, useState } from 'react'
import { MdQrCodeScanner } from 'react-icons/md'
import { Link } from 'react-router-dom'
import useSound from 'use-sound'
import OKSound from '../../../assets/se/ok.mp3'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useClipboard from '../../../hooks/useClipboard'
import useFirebase from '../../../hooks/useFirebase'
import useQRReader from '../../../hooks/useQRReader'
import useStream from '../../../hooks/useStream'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardStreamTerminalPage: React.FC = () => {
  const { user } = useFirebase()
  const [activeQRReader, setActiveQRReader] = useState(false)
  const [playSE, setPlaySE] = useState(false)
  const [isCopied, setCopied] = useState(false)
  const { data: qrData, QRReaderComponent } = useQRReader()
  const [playSEOK] = useSound(OKSound)
  const { startStream, writeStream, streamData } = useStream()
  const { copyToClipboardAsync } = useClipboard()

  const handleCopy = useCallback((data: string) => {
    copyToClipboardAsync(data)
      .then(() => setCopied(true))
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    if (!user) return

    const cancelToken = startStream('terminal')
    return () => cancelToken()
  }, [user])

  useEffect(() => {
    if (!user) return

    writeStream('terminal', qrData ?? null)
    playSE && playSEOK()
  }, [user, qrData])

  useEffect(() => {
    if (!streamData) return
    playSE && playSEOK()
  }, [streamData])

  useEffect(() => {
    if (!isCopied) return
    const cancelarationToken = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(cancelarationToken)
  }, [isCopied])

  return (
    <DashboardBaseLayout title="ストリームターミナル" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="ストリームターミナル"
        description="QR コードの情報を読み取りストリームに出力します"
        icon={<MdQrCodeScanner />} />

      <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormCheckbox
                name="play-se"
                checked={playSE}
                onChange={checked => setPlaySE(checked)}
                label="読み取り音を鳴らす" />
            </FormItem>
            <FormItem>
              <FormCheckbox
                name="active-qrreader"
                checked={activeQRReader}
                onChange={checked => setActiveQRReader(checked)}
                label="QR リーダーを開く" />
            </FormItem>
            {activeQRReader && <>
              <FormItem>
                <FormLabel>読み取り結果</FormLabel>
                <FormInput disabled value={qrData} />
              </FormItem>
              <FormItem>
                <QRReaderComponent />
              </FormItem>
            </>}
          </FormSection>
        </>
        <>
          <FormSection>
            <FormItem>
              <FormButton
                onClick={() => writeStream('terminal', `ping ${new Date().getTime()}`)}
                disabled={!user}>PING を送信</FormButton>
            </FormItem>
            <FormItem>
              <FormLabel>受け取った情報</FormLabel>
              <FormInput disabled value={streamData ?? ''} />
            </FormItem>
            <FormItem>
              <FormButton
                onClick={() => handleCopy(streamData ?? '')}
                disabled={isCopied}>{isCopied ? 'コピーしました' : 'コピー'}</FormButton>
            </FormItem>
          </FormSection>
        </>
      </TwoColumnsLayout>

    </DashboardBaseLayout>
  )
}

export default DashboardStreamTerminalPage
