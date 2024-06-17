import React, { useCallback, useState } from 'react'

import fm, { type FrontMatterResult } from 'front-matter'
import ReactMarkdown from 'react-markdown'

interface IUseDocs {
  fetchDocsByIdAsync: () => Promise<void>
  DocProvider: React.FC
  content: FrontMatterResult<{ title: string }> | undefined
}

const useDocs = (docId: string): IUseDocs => {
  const [content, setContent] = useState<FrontMatterResult<{ title: string }>>()

  const fetchDocsByIdAsync =
    async (): Promise<void> => {
      const res = await fetch(`/_docs/${docId}.md`)
      const text = await res.text()

      const fetchedContent = fm<{ title: string }>(text)
      setContent(fetchedContent)
    }

  const DocProvider: React.FC =
    useCallback(() => <ReactMarkdown>{content?.body ?? ''}</ReactMarkdown>, [content])

  return {
    fetchDocsByIdAsync,
    DocProvider,
    content
  }
}

export default useDocs
