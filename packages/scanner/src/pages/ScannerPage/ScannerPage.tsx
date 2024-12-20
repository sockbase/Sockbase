import { useState } from 'react'
import { PiCheckFatFill, PiX } from 'react-icons/pi'
import styled from 'styled-components'
import QRReaderComponent from '../../components/Parts/QRReaderComponent'

const ScannerPage: React.FC = () => {
  const [status, setStatus] = useState<'OK' | 'NG' | ''>('')

  return (
    <ReaderWrap>
      <QRReaderComponent
        onScan={_ => setStatus('OK')}
        style={{ height: '100%' }} />
      <InformationArea>
        {status === 'OK' && (
          <OKStatus onClick={() => setStatus('')}>
            <StatusIcon>
              <PiCheckFatFill />
            </StatusIcon>
          </OKStatus>
        )}
        {status === 'NG' && (
          <NGStatus onClick={() => setStatus('')}>
            <StatusIcon>
              <PiX />
            </StatusIcon>
            <StatusText>
              このQRコードは登録されていません
            </StatusText>
          </NGStatus>
        )}
      </InformationArea>
    </ReaderWrap>
  )
}

export default ScannerPage

const ReaderWrap = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`

const InformationArea = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`
const StatusBase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  width: 100%;
  height: 100%;
  color: white;
`
const OKStatus = styled(StatusBase)`
  background-color: rgba(32, 192, 32, 0.8);
`
const NGStatus = styled(StatusBase)`
  background-color: rgba(192, 32, 32, 0.8);
`
const StatusIcon = styled.div`
  width: 96px;
  height: 96px;
  svg {
    width: 100%;
    height: 100%;
  }
`
const StatusText = styled.div`
  font-size: 1.25em;
  font-weight: bold;
  text-align: center;
`
