import { useState } from 'react'
import DefaultBaseLayout from '../../components/Layout/DefaultBaseLayout/DefaultBaseLayout'
import StaticDocumentProvider from '../../components/Providers/StaticDocumentProvider/StaticDocumentProvider'

const PrivacyPolicyPage: React.FC =
  () => {
    const [title, setTitle] = useState<string>()

    return (
      <DefaultBaseLayout title={title}>
        <StaticDocumentProvider
          docId='privacy-policy'
          setTitle={t => setTitle(t)} />
      </DefaultBaseLayout>
    )
  }

export default PrivacyPolicyPage
