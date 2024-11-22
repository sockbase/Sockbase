import styled from 'styled-components'

const NoPrintArea = styled.div`
  @media print {
    display: none;
  }
`

export default NoPrintArea
