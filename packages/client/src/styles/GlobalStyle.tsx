import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
html, body {
  font-family: "Noto Sans JP", sans-serif;
  height: 100vh;
  height: 100dvh;
}
body {
  background-image: url('/assets/bg-pattern.png');
  background-position: center;
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
  color: var(--primary-color);
  border-bottom: 4px solid var(--primary-color);
  position: relative;
  display: inline;
  z-index: 0;
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
  color: var(--primary-color);
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
    background-color: #ffffff;
    &:nth-child(2n) {
      background-color: #f8f8f8;
    }
  }
  th, td {
    padding: 10px;
    text-align: left;
  }

  thead {
    tr {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
  }

  tbody {
    border-top: 2px solid #ea6183;
    border-bottom: 2px solid #ea6183;

    th {
      width: 30%;
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

code {
  display: inline-block;
  margin: 0 5px;
  padding: 5px 10px;
  border-radius: 5px;

  font-family: 'Consolas', 'Osaka-Mono', monospace;
  font-size: 1em;
  
  background-color: #e0e0e0;
}
`

export default GlobalStyle
