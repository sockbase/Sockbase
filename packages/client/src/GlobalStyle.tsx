import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
:root {
  --darkAccentColor: #ea6183;
}
html, body {
  font-family: "Noto Sans JP", sans-serif;
  height: 100vh;
}
input, select, textarea {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 1rem;
}
#root {
  height: 100%;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
}

h1 { font-size: 2em; }
h2 {
  padding-bottom: 4px;
  font-size: 1.5em;
  color: var(--darkAccentColor);
  border-bottom: 4px solid var(--darkAccentColor);
  position: relative;
  display: inline;
  &::after {
    display: block;
    content: '';
    height: 6px;
    border-bottom: 2px solid #e0e0e0;
    position: inherit;
    z-index: -1;
    margin-bottom: 20px;
  }
}
h3 {
  font-size: 1em;
  color: var(--darkAccentColor);
}
h4 { font-size: 0.9em; }
h5 { font-size: 0.8em; }
h6 { font-size: 0.7em; }

table {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
  
  width: 100%;
  border-collapse: collapse;
  tr {
    background-color: #e8e8e8;
    &:nth-child(2n + 1) {
      background-color: #F8F8F8;
    }
  }
  th, td {
    padding: 10px;
    text-align: left;

    &:nth-child(2n) {
      background-color: #ffffff40;
    }
  }

  thead {
    border-bottom: 2px solid #c0c0c0;
    tr {
      background-color: #ea6183 !important;
      color: #ffffff !important;
    }
  }
}

a {
  color: #ea6183;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
`

export default GlobalStyle
