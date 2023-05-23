import styled from 'styled-components'

const Breadcrumbs = styled.ul`
  margin: 0;
  margin-bottom: 10px;
  padding: 0;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  list-style: none;
  li {
    margin: 0;
    padding: 0;
    display: inline-block;
    padding-right: 24px;

    position: relative;
    &::after {
      position: absolute;
      display: inline-block;
      content: '';
      width: 8px;
      height: 8px;
      top: calc(50% - 4px);
      right: 10px;
      
      border-bottom: 2px solid #c0c0c0;
      border-right: 2px solid #c0c0c0;
      transform: rotate(-45deg);
    }
  }
`

export default Breadcrumbs
