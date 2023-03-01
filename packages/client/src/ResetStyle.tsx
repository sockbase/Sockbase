import { createGlobalStyle } from 'styled-components'

const ResetStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}
html, body, ul, ol, li, fieldset, textarea {
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
fieldset {
  border: none;
}
`

export default ResetStyle
