import { useState } from 'react'
import DefaultLayout from '../../components/Layout/Default/Default'
import StaticDocumentProvider from '../../components/StaticDocumentProvider/StaticDocumentProvider'

const PrivacyPolicy: React.FC =
  () => {
    const [title, setTitle] = useState<string>()

    return (
      <DefaultLayout title={title}>
        <StaticDocumentProvider
          docId='privacy-policy'
          setTitle={t => setTitle(t)} />
      </DefaultLayout>
    )
  }

export default PrivacyPolicy
