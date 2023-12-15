import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  & {
    width: 5px;
  }
  &-thumb {
    background-color: #00000040;

    &:hover {
      background-color: #00000080;
    }
  }
}

html, body {
  font-family: "LINE Seed JP", sans-serif;
  font-size: 16px;
  height: 100vh;
  height: 100dvh;
  
  position: fixed;
  left: 0;
  right: 0;
  overflow: hidden;
}
html, body, fieldset, textarea {
  margin: 0;
  padding: 0;
}
#root {
  height: 100%;
}
`

export default GlobalStyle
