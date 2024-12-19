import type { ReactElement } from 'react'
import { MdCheck, MdDangerous, MdInfoOutline, MdWarningAmber } from 'react-icons/md'
import styled from 'styled-components'

type AlertType = 'info' | 'success' | 'warning' | 'error'

const iconMap: Record<AlertType, ReactElement> = {
  info: <MdInfoOutline />,
  success: <MdCheck />,
  warning: <MdWarningAmber />,
  error: <MdDangerous />
}

const colorMap: Record<AlertType, string> = {
  info: 'var(--info-color)',
  success: 'var(--success-color)',
  warning: 'var(--warning-color)',
  error: 'var(--danger-color)'
}

interface Props {
  type: AlertType
  title: string
  children?: React.ReactNode
}
const Alert: React.FC<Props> = props => {
  return (
    <Container type={props.type}>
      <Header>
        <HeaderIcon type={props.type}>
          {iconMap[props.type]}
        </HeaderIcon>
        <HeaderTitle>
          {props.title}
        </HeaderTitle>
      </Header>
      {props.children && <Body>{props.children}</Body>}
    </Container>
  )
}

export default Alert

const Container = styled.div<{ type: AlertType }>`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid ${props => colorMap[props.type]};
  border-left: 6px solid ${props => colorMap[props.type]};
  border-radius: 5px;
  background-color: var(--inputfield-background-color);
`
const Header = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
`
const HeaderIcon = styled.div<{ type: AlertType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 24px;
    height: 24px;
    color: ${props => colorMap[props.type]};
  }
`
const HeaderTitle = styled.div`
  font-weight: bold;
`
const Body = styled.div``
