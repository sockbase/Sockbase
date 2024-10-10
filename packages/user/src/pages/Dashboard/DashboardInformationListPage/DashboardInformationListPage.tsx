import { useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { type SockbaseInformationDocument } from 'sockbase'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import LinkButton from '../../../components/Parts/LinkButton'
import useDayjs from '../../../hooks/useDayjs'
import useInformation from '../../../hooks/useInformation'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'

const DashboardInformationListPage: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { getInformationsAsync } = useInformation()

  const [informations, setInformations] = useState<SockbaseInformationDocument[]>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      const fetchedInformations = await getInformationsAsync()
      setInformations(fetchedInformations)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [])

  return (
    <DashboardBaseLayout title="お知らせ管理" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        title="お知らせ管理"
        description="お知らせを管理します。"
        icon={<MdInfo />} />
      <FormSection>
        <FormItem inlined>
          <LinkButton
            to="/dashboard/informations/create"
            inlined>
          お知らせ作成
          </LinkButton>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>更新日</th>
            <th>タイトル</th>
            <th style={{ width: '15%' }}>公開？</th>
          </tr>
        </thead>
        <tbody>
          {informations?.sort((a, b) => b.updatedAt - a.updatedAt)
            .map(i => <tr key={i.id}>
              <td>{formatByDate(i.updatedAt, 'YYYY年 M月 D日')}</td>
              <td><Link to={`/dashboard/informations/${i.id}`}>{i.title}</Link></td>
              <td>{i.isPublished ? '公開' : '-'}</td>
            </tr>)}
        </tbody>
      </table>
    </DashboardBaseLayout>
  )
}

export default DashboardInformationListPage
