import { useState, useEffect } from 'react'
import { MdAdd, MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { type SockbaseInformationDocument } from 'sockbase'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import useDayjs from '../../hooks/useDayjs'
import useInformation from '../../hooks/useInformation'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const InformationListPage: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { getInformationsAsync } = useInformation()

  const [informations, setInformations] = useState<SockbaseInformationDocument[]>()

  useEffect(() => {
    getInformationsAsync()
      .then(setInformations)
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout title='お知らせ管理' requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdInfo />}
        title="お知らせ管理" />

      <FormSection>
        <FormItem>
          <LinkButton to="/informations/create">
            <IconLabel icon={<MdAdd />} label='お知らせ作成' />
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
              <td>{i.isPublished ? '公開' : '---'}</td>
            </tr>)}
          {informations?.length === 0 && (
            <tr>
              <td colSpan={3}>お知らせはありません</td>
            </tr>
          )}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default InformationListPage
