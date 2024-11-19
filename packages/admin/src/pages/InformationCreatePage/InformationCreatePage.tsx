import { useCallback } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import InformationEditor from '../../components/Editors/InformationEditor/InformationEditor'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useInformation from '../../hooks/useInformation'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseInformationDocument } from 'sockbase'

const InformationCreatePage: React.FC = () => {
  const { createInformationAsync } = useInformation()

  const handleCreate = useCallback((info: SockbaseInformationDocument) => {
    createInformationAsync(info)
      .then(() => alert('作成しました'))
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout title='お知らせ作成' requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/informations">お知らせ管理</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdInfo />}
        title="お知らせ作成" />

      <InformationEditor
        isNewInformation={true}
        handleChange={handleCreate} />
    </DefaultLayout>
  )
}

export default InformationCreatePage
