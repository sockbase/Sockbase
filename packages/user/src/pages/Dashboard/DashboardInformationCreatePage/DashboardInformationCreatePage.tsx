import { useCallback } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { type SockbaseInformationDocument } from 'sockbase'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useInformation from '../../../hooks/useInformation'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import InformationEditor from '../DashboardInformationDetailPage/InformationEditor'

const DashboardInformationCreatePage: React.FC = () => {
  const { createInformationAsync } = useInformation()

  const handleCreate = useCallback((info: SockbaseInformationDocument) => {
    createInformationAsync(info)
      .then(() => alert('作成しました'))
      .catch(err => { throw err })
  }, [])

  return (
    <DashboardBaseLayout title="お知らせ作成" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">ホーム</Link></li>
        <li>お知らせ管理</li>
      </Breadcrumbs>

      <PageTitle
        title="お知らせ作成"
        description="お知らせを作成します。"
        icon={<MdInfo />} />

      <InformationEditor
        isNewInformation={true}
        handleChange={handleCreate} />
    </DashboardBaseLayout>
  )
}

export default DashboardInformationCreatePage
