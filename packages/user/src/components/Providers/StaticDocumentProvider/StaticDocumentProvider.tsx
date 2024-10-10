import { useEffect } from 'react'
import useDocs from '../../../hooks/useDocs'

interface Props {
  docId: string
  setTitle: (t: string) => void
}
const StaticDocumentProvider: React.FC<Props> = (props) => {
  const { fetchDocsByIdAsync, DocProvider, content } = useDocs(props.docId)

  const onInitialize: () => void =
    () => {
      fetchDocsByIdAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [])

  const onUpdatedContent: () => void =
    () => {
      if (!content) return
      props.setTitle(content.attributes.title)
    }
  useEffect(onUpdatedContent, [content])

  return <DocProvider />
}

export default StaticDocumentProvider
