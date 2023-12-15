import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import {
  MdHome,
  MdQrCodeScanner,
  MdBadge,
  MdInbox,
  MdEditCalendar,
  MdStore
} from 'react-icons/md'

const Sidebar: React.FC = () => {
  return (
    <Container>
      <Menu>
        <MenuItemLink to=''>
          <MenuItemIcon><MdHome /></MenuItemIcon>
          <MenuItemLabel>トップ</MenuItemLabel>
        </MenuItemLink>
      </Menu>
      <Menu>
        <MenuItemLink to=''>
          <MenuItemIcon><MdQrCodeScanner /></MenuItemIcon>
          <MenuItemLabel>チケット照会ターミナル</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to=''>
          <MenuItemIcon><MdBadge /></MenuItemIcon>
          <MenuItemLabel>権限</MenuItemLabel>
        </MenuItemLink>
      </Menu>
      <Menu>
        <MenuItemLink to=''>
          <MenuItemIcon><MdInbox /></MenuItemIcon>
          <MenuItemLabel>問い合わせ管理</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to=''>
          <MenuItemIcon><MdEditCalendar /></MenuItemIcon>
          <MenuItemLabel>イベント管理</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to=''>
          <MenuItemIcon><MdStore /></MenuItemIcon>
          <MenuItemLabel>チケットストア管理</MenuItemLabel>
        </MenuItemLink>
      </Menu>
    </Container>
  )
}

export default Sidebar

const Container = styled.div`
`

const Menu = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`

const MenuItemLinkMixin = css`
  display: grid;
  gap: 5px;
  grid-template-columns: 24px 1fr;
  
  align-items: center;

  padding: 10px;
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: 0.1s ease;

  &:first-child {
    border-radius: 5px 5px 0 0;
  }
  &:last-child {
    border-radius: 0 0 5px 5px;
    border: none;
  }
  &:only-child {
    border-radius: 5px;
    border: none;
  }

  &:hover, &:active {
    background-color: var(--border-color);
  }
`
const MenuItemLink = styled(Link)`
  ${MenuItemLinkMixin}
  text-decoration: none;
  color: inherit;
`
  
const MenuItemIcon = styled.span`
  display: flex;
  svg {
    width: 100%;
    height: 100%;
  }
`
const MenuItemLabel = styled.span`
`
