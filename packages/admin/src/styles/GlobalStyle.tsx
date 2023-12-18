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
html, body, fieldset, textarea,
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  padding: 0;
}
fieldset {
  border: none;
}
p {
  margin: 0;
  margin-bottom: 10px;
  padding: 10px;
  
  border-radius: 5px;
  background-color: var(--brand-white-color);
  
  &:last-child {
    margin-bottom: 0;
  }
}
h3 {
  margin-bottom: 2px;
  font-size: 0.95em;
  font-weight: normal;
  color: var(--gray-color);
}
#root {
  height: 100%;
}
`

export default GlobalStyle
