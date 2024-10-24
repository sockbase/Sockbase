import styled from 'styled-components'

const Breadcrumbs = styled.ul`
  margin: 0;
  margin-bottom: 10px;
  padding: 0;
  font-size: 0.9em;
  
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
      width: 6px;
      height: 6px;
      top: calc(50% - 3px);
      right: 10px;
      
      border-bottom: 1px solid var(--outline-color);
      border-right: 1px solid var(--outline-color);
      transform: rotate(-45deg);
    }
  }
`

export default Breadcrumbs
