import { useState, useEffect, useCallback } from 'react'
import { MdCopyAll, MdLibraryAddCheck } from 'react-icons/md'
import styled from 'styled-components'
import useClipboard from '../../hooks/useClipboard'

interface Props {
  content: string | null | undefined
}
const CopyToClipboard: React.FC<Props> = props => {
  const [isCopied, setCopied] = useState(false)
  const { copyToClipboardAsync } = useClipboard()

  const copyToClipboard = useCallback(() => {
    if (!props.content) return
    copyToClipboardAsync(props.content)
      .then(() => setCopied(true))
      .catch(err => { throw err })
  }, [props.content])

  useEffect(() => {
    if (!isCopied) return
    const cancelarationToken = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(cancelarationToken)
  }, [isCopied])

  return (
    <Container
      $isActive={isCopied}
      onClick={copyToClipboard}>
      {
        isCopied
          ? <MdLibraryAddCheck />
          : <MdCopyAll />
      }
    </Container>
  )
}

export default CopyToClipboard

const Container = styled.button<{ $isActive: boolean }>`
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 5px;
  font-size: 1.25em;
  background-color: transparent;
  color: var(--text-light-color);
  cursor: pointer;

  vertical-align: middle;
  
  &:active {
    outline: none;
  }
`
