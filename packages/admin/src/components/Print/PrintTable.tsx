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
    max-height: 20mm;
  }
  tbody {
    border: 0.25mm solid black;
    th {
      width: 30%;
    }
    th, td {
      border: 0.25mm solid black;
      vertical-align: top;
    }
  }
`

export default PrintTable
