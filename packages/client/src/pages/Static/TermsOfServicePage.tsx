import { useState } from "react"
import DefaultBaseLayout from "../../components/Layout/DefaultBaseLayout/DefaultBaseLayout"
import StaticDocumentProvider from "../../components/Providers/StaticDocumentProvider/StaticDocumentProvider"

const TermsOfServicePage: React.FC =
  () => {
    const [title, setTitle] = useState<string>()

    return (
      <DefaultBaseLayout title={title}>
        <StaticDocumentProvider
          docId="tos"
          setTitle={t => setTitle(t)} />
      </DefaultBaseLayout>
    )
  }

export default TermsOfServicePage
