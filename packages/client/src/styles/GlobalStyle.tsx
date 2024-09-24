import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
html, body {
  font-family: "LINE Seed JP", sans-serif;
  height: 100vh;
  height: 100dvh;
}

body {
  // background-image: url('/assets/bg-pattern.png');
  // background-position: center;
}

input, select, textarea {
  font-family: "LINE Seed JP", sans-serif;
  font-size: 1rem;
}

::-webkit-scrollbar {
  & {
    width: 5px;
    height: 5px;
  }
  &-thumb {
    background-color: var(--scroll-thumb-color);
    opacity: 10%;

    &:hover {
      background-color: var(--scroll-thumb-active-color);
      opacity: 10%;
    }
  }
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
  color: var(--primary-brand-color);
  border-bottom: 4px solid var(--primary-brand-color);
  position: relative;
  display: inline;
  z-index: 0;
  &::after {
    display: block;
    content: '';
    height: 6px;
    border-bottom: 2px solid var(--title-border-color);
    position: inherit;
    z-index: -1;
    margin-bottom: 20px;
  }
}
h3 {
  font-size: 1em;
  color: var(--primary-brand-color);
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

  color: var(--text-color);

  tr {
    background-color: var(--background-color);
    &:nth-child(2n) {
      background-color: var(--background-light2-color);
    }
  }
  th, td {
    padding: 10px;
    text-align: left;
  }

  thead {
    tr {
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
    }
  }

  tbody {
    border-top: 2px solid var(--border-color);
    border-bottom: 2px solid var(--border-color);

    th {
      width: 30%;
    }
  }
}

a {
  color: var(--link-color);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
  cursor: pointer;
}

ul, ol, p {
  color: var(--text-color);
  line-height: 2em;
}

code {
  display: inline-block;
  margin: 0 5px;
  padding: 5px 10px;
  border-radius: 5px;

  font-family: 'Consolas', 'Osaka-Mono', monospace;
  font-size: 1em;
  
  background-color: var(--background-dark-color);
}

details {
  padding: 10px;
  border-radius: 5px;
  background-color: var(--background-light-color);
  color: var(--text-color);

  &:not([open]) summary {
    margin-bottom: 0;
  }
}

summary {
  margin: 0;
  margin-bottom: 10px;
  user-select: none;
  cursor: pointer;
}
`

export default GlobalStyle
