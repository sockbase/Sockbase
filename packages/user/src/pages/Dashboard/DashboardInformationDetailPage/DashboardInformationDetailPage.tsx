import { useCallback, useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useInformation from '../../../hooks/useInformation'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import InformationEditor from './InformationEditor'
import type { SockbaseInformationDocument } from 'sockbase'

const DashboardInformationDetailPage: React.FC = () => {
  const { informationId } = useParams<{ informationId: string }>()
  const {
    getInformationByIdAsync,
    updateInformationAsync
  } = useInformation()

  const [information, setInformation] = useState<SockbaseInformationDocument>()

  const handleEdit = useCallback((info: SockbaseInformationDocument) => {
    updateInformationAsync(info.id, info)
      .then(() => {
        alert('更新しました')
        setInformation(info)
      })
      .catch(err => { throw err })
  }, [updateInformationAsync])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!informationId) return
      const fetchedInformation = await getInformationByIdAsync(informationId)
      setInformation(fetchedInformation)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [informationId])

  return (
    <DashboardBaseLayout title="お知らせ詳細" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">ホーム</Link></li>
        <li><Link to="/dashboard/informations">お知らせ管理</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={information?.title}
        description={`お知らせ #${information?.id}`}
        icon={<MdInfo />}
        isLoading={!information} />

      <InformationEditor
        information={information}
        handleChange={handleEdit} />
    </DashboardBaseLayout>
  )
}

export default DashboardInformationDetailPage
