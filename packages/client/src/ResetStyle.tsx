import { createGlobalStyle } from 'styled-components'

const ResetStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}
html, body, ul, ol, li {
  margin: 0;
  padding: 0;
}
h1, h2, h3, h4, h5, h6, p {
  margin: 0;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
`

export default ResetStyle
