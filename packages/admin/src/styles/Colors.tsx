import { createGlobalStyle } from 'styled-components'

const Colors = createGlobalStyle`
:root {
  --primary-color: #00a8ff;
  --primary-text-color: #0088cc;
  --secondary-color: #ea6183;
  --brand-black-color: #202020;
  --brand-white-color: #ffffff;
  --primary-lightgray-color: #edf2f5;
  --primary-gray-color: #e5eaed;
  --primary-darkgray-color: #e2e7ea;
  --gray-color: #808080;
  --border-color: #c8cccf;
  --danger-color: #b52e2e;
  --info-color: #3781bc;
  --disable-color: #c0c0c0;
}
`

export default Colors
