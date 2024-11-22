import styled from 'styled-components'

const PrintBlankBar: React.FC = () => {
  return (
    <BlankLabel>
      以下余白
    </BlankLabel>
  )
}

export default PrintBlankBar

const BlankLabel = styled.div`
  border-top: 1px dashed black;
  text-align: center;
  padding-top: 1mm;
  letter-spacing: 1em;
`
