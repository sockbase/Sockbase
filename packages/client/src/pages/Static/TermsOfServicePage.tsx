import { useState } from 'react'
import { Link } from 'react-router-dom'
import DefaultBaseLayout from '../../components/Layout/DefaultBaseLayout/DefaultBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import StaticDocumentProvider from '../../components/Providers/StaticDocumentProvider/StaticDocumentProvider'

const TermsOfServicePage: React.FC =
  () => {
    const [title, setTitle] = useState<string>()

    return (
      <DefaultBaseLayout title={title}>
        <Breadcrumbs>
          <li><Link to="/">ホーム</Link></li>
        </Breadcrumbs>

        <StaticDocumentProvider
          docId="tos"
          setTitle={t => setTitle(t)} />
      </DefaultBaseLayout>
    )
  }

export default TermsOfServicePage
