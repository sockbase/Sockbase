import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  padding: 0;
}
body {
  font-family: sans-serif;
}
`

export default GlobalStyle
