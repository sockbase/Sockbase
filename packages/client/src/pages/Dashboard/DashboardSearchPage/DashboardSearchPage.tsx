import { useCallback, useState } from 'react'
import { MdSearch } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { type SockbaseApplicationHashIdDocument } from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import Alert from '../../../components/Parts/Alert'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useApplication from '../../../hooks/useApplication'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardSearchPage: React.FC = () => {
  const { getApplicationIdByHashedIdAsync } = useApplication()

  const [appHashId, setAppHashId] = useState('')
  const [appHashDoc, setAppHashDoc] = useState<SockbaseApplicationHashIdDocument | null>()

  const [processStatus, setProcessStatus] = useState({
    application: false
  })

  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleGetApplicationId = useCallback(() => {
    const fetchAsync = async (): Promise<void> => {
      setErrorMessage(null)

      if (!appHashId) return
      setProcessStatus(s => ({ ...s, processStatus: true }))

      const fetchedAppHashDoc = await getApplicationIdByHashedIdAsync(appHashId)
        .catch((err: Error) => {
          if (err.message.includes('hashId not found')) {
            setErrorMessage('指定された申し込みIDの情報が見つかりませんでした')
          } else {
            setErrorMessage(`エラーが発生しました ${err.message}`)
          }
          return null
        })
        .finally(() => {
          setProcessStatus(s => ({ ...s, processStatus: false }))
        })

      setAppHashDoc(fetchedAppHashDoc)
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [appHashId])

  return (
    <DashboardBaseLayout title="検索 (BETA)" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="検索 (BETA)" icon={<MdSearch />} description="横断検索には対応していません" />
      <TwoColumnsLayout>
        <>
          <h2>サークル参加申し込み情報</h2>
          <FormSection>
            <FormItem>
              <FormLabel>申し込み ID</FormLabel>
              <FormInput
                placeholder='2024xxxxxxxxxxxxx-xxxxxxxx'
                value={appHashId}
                onChange={e => setAppHashId(e.target.value)} />
            </FormItem>
            <FormItem>
              <FormButton
                onClick={handleGetApplicationId}
                inlined={true}
                disabled={processStatus.application || !appHashId}>検索</FormButton>
            </FormItem>
            {errorMessage && <FormItem>
              <Alert type="error" title="エラーが発生しました">{errorMessage}</Alert>
            </FormItem>}
          </FormSection>
        </>
        <>
          <h2>検索結果</h2>
          <table>
            <tbody>
              <tr>
                <th>申し込み ID</th>
                <td>
                  <a href={`/dashboard/applications/${appHashDoc?.hashId}`} target="_blank" rel="noreferrer">{appHashDoc?.hashId}</a>
                </td>
              </tr>
              <tr>
                <th>申し込み内部 ID</th>
                <td>{appHashDoc?.applicationId}</td>
              </tr>
              <tr>
                <th>支払い内部 ID</th>
                <td>{appHashDoc?.paymentId}</td>
              </tr>
              <tr>
                <th>スペース内部 ID</th>
                <td>{appHashDoc?.spaceId}</td>
              </tr>
              <tr>
                <th>イベント組織 ID</th>
                <td>{appHashDoc?.organizationId}</td>
              </tr>
              <tr>
                <th>イベント ID</th>
                <td>{appHashDoc?.eventId}</td>
              </tr>
              <tr>
                <th>ユーザ ID</th>
                <td>{appHashDoc?.userId}</td>
              </tr>
            </tbody>
          </table>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardSearchPage
