import { useState, useEffect } from 'react'
import styled from 'styled-components'

import { MdCopyAll, MdLibraryAddCheck } from 'react-icons/md'

interface Props {
  content: string
}
const CopyToClipboard: React.FC<Props> = (props) => {
  const [isCopied, setCopied] = useState(false)

  const onChangeCopiedStatus: () => void =
    () => {
      if (!isCopied) return
      const cancelarationToken = setTimeout(() => setCopied(false), 1000)
      return () => cancelarationToken
    }
  useEffect(onChangeCopiedStatus, [isCopied])

  const copyToClipboard: () => void =
    () => {
      const copyToClipboardAsync: () => Promise<void> =
        async () => {
          await navigator.clipboard.writeText(props.content)
        }
      copyToClipboardAsync()
        .then(() => setCopied(true))
        .catch(err => {
          throw err
        })
    }

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
  color: #ea6183;
  cursor: pointer;

  vertical-align: middle;
  
  &:active {
    color: #aa2143;
    outline: none;
  }
`