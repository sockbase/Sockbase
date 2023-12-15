import { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import {
  MdHome,
  MdQrCodeScanner,
  MdBadge,
  MdInbox,
  MdEditCalendar,
  MdStore,
  MdLogout,
  MdLogin,
} from 'react-icons/md'

const Sidebar: React.FC = () => {
  const handleLogout = useCallback((): void => {
    confirm('ログアウトしますか？')
  }, [])

  return (
    <Container>
      <Card>
        <CardTitle>ログイン中ユーザ</CardTitle>
        <CardContent>xxx@sockbase.net</CardContent>
      </Card>

      <Menu>
        <MenuItemLink to="/login">
          <MenuItemIcon>
            <MdLogin />
          </MenuItemIcon>
          <MenuItemLabel>ログイン</MenuItemLabel>
        </MenuItemLink>
        <MenuItemButton onClick={handleLogout}>
          <MenuItemIcon>
            <MdLogout />
          </MenuItemIcon>
          <MenuItemLabel>ログアウト</MenuItemLabel>
        </MenuItemButton>
      </Menu>

      <Menu>
        <MenuItemLink to="/">
          <MenuItemIcon>
            <MdHome />
          </MenuItemIcon>
          <MenuItemLabel>トップ</MenuItemLabel>
        </MenuItemLink>
      </Menu>

      <MenuTitle>イベント開催支援</MenuTitle>
      <Menu>
        <MenuItemLink to="">
          <MenuItemIcon>
            <MdQrCodeScanner />
          </MenuItemIcon>
          <MenuItemLabel>チケット照会ターミナル</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to="">
          <MenuItemIcon>
            <MdBadge />
          </MenuItemIcon>
          <MenuItemLabel>権限</MenuItemLabel>
        </MenuItemLink>
      </Menu>

      <MenuTitle>システム操作</MenuTitle>
      <Menu>
        <MenuItemLink to="">
          <MenuItemIcon>
            <MdInbox />
          </MenuItemIcon>
          <MenuItemLabel>問い合わせ管理</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to="">
          <MenuItemIcon>
            <MdEditCalendar />
          </MenuItemIcon>
          <MenuItemLabel>イベント管理</MenuItemLabel>
        </MenuItemLink>
        <MenuItemLink to="">
          <MenuItemIcon>
            <MdStore />
          </MenuItemIcon>
          <MenuItemLabel>チケットストア管理</MenuItemLabel>
        </MenuItemLink>
      </Menu>
    </Container>
  )
}

export default Sidebar

const Container = styled.div``

const Card = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: var(--brand-black-color);
  color: var(--brand-white-color);
`
const CardTitle = styled.div`
  font-weight: bold;
  font-size: 0.75em;
`
const CardContent = styled.div`
  margin-top: -2px;
`

const MenuTitle = styled.div`
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.75em;
  color: var(--sub-dark-color);
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

  &:hover,
  &:active {
    background-color: var(--border-color);
  }
`
const MenuItemIcon = styled.span`
  display: flex;
  svg {
    width: 100%;
    height: 100%;
  }
`
const MenuItemLabel = styled.span``
const MenuItemLink = styled(Link)`
  ${MenuItemLinkMixin}
  text-decoration: none;
  color: inherit;
`
const MenuItemButton = styled.button`
  ${MenuItemLinkMixin}
  font: inherit;
  text-align: inherit;
  color: inherit;
`
