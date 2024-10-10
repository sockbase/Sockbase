import { useState, useEffect, useCallback } from 'react'
import { MdCopyAll, MdLibraryAddCheck } from 'react-icons/md'
import styled from 'styled-components'
import useClipboard from '../../hooks/useClipboard'

interface Props {
  content: string
}
const CopyToClipboard: React.FC<Props> = (props) => {
  const [isCopied, setCopied] = useState(false)
  const { copyToClipboardAsync } = useClipboard()

  const copyToClipboard = useCallback((): void => {
    copyToClipboardAsync(props.content)
      .then(() => setCopied(true))
      .catch(err => {
        throw err
      })
  }, [props.content])

  useEffect(() => {
    if (!isCopied) return

    const cancelarationToken = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(cancelarationToken)
  }, [isCopied])

  return (
    <StyledCopyButton onClick={copyToClipboard} isActive={isCopied}>
      {
        isCopied
          ? <MdLibraryAddCheck />
          : <MdCopyAll />
      }
    </StyledCopyButton>
  )
}

export default CopyToClipboard

const StyledCopyButton = styled.button<{ isActive: boolean }>`
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 5px;
  font-size: 1.25em;
  background-color: transparent;
  color: var(--primary-brand-color);
  cursor: pointer;

  vertical-align: middle;
  
  &:active {
    color: var(--primary-brand-active-color);
    outline: none;
  }
`
