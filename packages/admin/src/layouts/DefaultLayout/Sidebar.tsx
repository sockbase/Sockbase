import styled from 'styled-components'
import LogotypeSVG from '../../assets/logotype.svg'

const Sidebar: React.FC = () => {
  return (
    <Container>
      <BrandWrap>
        <BrandLogotype src={LogotypeSVG} alt="Logo" />
      </BrandWrap>
    </Container>
  )
}

export default Sidebar

const Container = styled.div``
const BrandWrap = styled.div`
  background-color: var(--background-light-color);
  color: white;
  padding: 10px;
  font-size: 0;
`
const BrandLogotype = styled.img`
  height: 16px;
`
