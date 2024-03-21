import { useEffect, useState } from 'react'
import { MdQrCodeScanner } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormButton from '../../components/Form/Button'
import FormCheckbox from '../../components/Form/Checkbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useFirebase from '../../hooks/useFirebase'
import useQRReader from '../../hooks/useQRReader'
import useStream from '../../hooks/useStream'

const DashboardStreamTerminalPage: React.FC = () => {
  const { user } = useFirebase()
  const { data: qrData, QRReaderComponent } = useQRReader()

  const [activeQRReader, setActiveQRReader] = useState(false)

  const { startStream, writeStream, streamData } = useStream()

  useEffect(() => {
    if (!user) return

    const cancelToken = startStream('terminal')
    return () => cancelToken()
  }, [user])

  useEffect(() => {
    if (!user) return

    writeStream('terminal', qrData ?? null)
  }, [user, qrData])

  return (
    <DashboardBaseLayout title="ストリームターミナル" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="ストリームターミナル"
        description="QRコードの情報を読み取りストリームに出力します"
        icon={<MdQrCodeScanner />} />

      <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormCheckbox
                name="active-qrreader"
                checked={activeQRReader}
                onChange={checked => setActiveQRReader(checked)}
                label="QRリーダーを開く" />
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
                disabled={!user}>PINGを送信</FormButton>
            </FormItem>
            <FormItem>
              <FormLabel>受け取った情報</FormLabel>
              <FormInput disabled value={streamData ?? ''} />
            </FormItem>
          </FormSection>
        </>
      </TwoColumnsLayout>

    </DashboardBaseLayout>
  )
}

export default DashboardStreamTerminalPage
