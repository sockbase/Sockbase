import { useCallback, useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseInformationDocument } from 'sockbase'
import InformationEditor from '../../components/Editors/InformationEditor/InformationEditor'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useInformation from '../../hooks/useInformation'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const InformationViewPage: React.FC = () => {
  const { informationId } = useParams()
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
  }, [])

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
    <DefaultLayout title="お知らせ情報照会">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/informations">お知らせ管理</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdInfo />}
        title="お知らせ情報照会" />

      <InformationEditor
        information={information}
        handleChange={handleEdit} />
    </DefaultLayout>
  )
}

export default InformationViewPage
