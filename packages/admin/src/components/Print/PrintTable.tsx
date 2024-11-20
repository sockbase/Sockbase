import styled from 'styled-components'

const PrintTable = styled.table`
  margin-bottom: 1mm;
  &:last-child {
    margin-bottom: 0;
  }

  border-collapse: collapse;
  width: 100%;
  th, td {
    padding: 0.5mm 1mm;
    word-break: break-all;
  }
  tbody {
    border: 1px solid black;
    th {
      width: 30%;
    }
    th, td {
      border: 1px solid black;
      vertical-align: top;
    }
  }
`

export default PrintTable
