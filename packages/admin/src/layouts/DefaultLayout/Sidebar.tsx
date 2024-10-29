import {
  MdBadge,
  MdEditCalendar,
  MdGroup,
  MdHome,
  MdInbox,
  MdInfo,
  MdLogin,
  MdLogout,
  MdManageAccounts,
  MdQrCodeScanner,
  MdStore
} from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import type { User } from 'firebase/auth'
import type { SockbaseRole } from 'sockbase'

const menuLinks = [
  {
    sectionName: null,
    requireCommonRole: 1,
    requireSystemRole: null,
    items: [
      { to: '/', icon: <MdHome />, label: 'ホーム' },
      { to: '/license', icon: <MdBadge />, label: '権限' }
    ]
  },
  {
    sectionName: '入場管理',
    requireCommonRole: 1,
    requireSystemRole: null,
    items: [
      { to: '/tickets/terminal', icon: <MdQrCodeScanner />, label: 'チケット照会ターミナル' }
    ]
  },
  {
    sectionName: 'イベント管理',
    requireCommonRole: 2,
    requireSystemRole: null,
    items: [
      { to: '/events', icon: <MdEditCalendar />, label: 'イベント管理' },
      { to: '/stores', icon: <MdStore />, label: 'チケットストア管理' }
    ]
  },
  {
    sectionName: 'システム管理',
    requireCommonRole: null,
    requireSystemRole: 2,
    items: [
      { to: '/inquiries', icon: <MdInbox />, label: '問い合わせ管理' },
      { to: '/informations', icon: <MdInfo />, label: 'お知らせ管理' },
      { to: '/users', icon: <MdManageAccounts />, label: 'ユーザ管理' },
      { to: '/organizations', icon: <MdGroup />, label: '組織管理' }
    ]
  }
]

interface Props {
  showMenu: boolean
  user: User | null | undefined
  commonRole: SockbaseRole | null | undefined
  systemRole: SockbaseRole | null | undefined
  logout: () => void
  closeMenu: () => void
}

const Sidebar: React.FC<Props> = (props) => {
  return (
    props.showMenu
      ? <Container>
        <MenuWrap>
          {props.user === null && (
            <MenuSection>
              <MenuLinkItem to="/login">
                <MenuIcon><MdLogin /></MenuIcon>
                <MenuLabel>ログイン</MenuLabel>
              </MenuLinkItem>
            </MenuSection>
          )}
          {props.user && (
            <>
              <MenuSection>
                <MenuItemCard>
                  <MenuItemCardTitle>ログイン中ユーザ</MenuItemCardTitle>
                  <MenuItemCardContent>
                    {props.user.email}
                  </MenuItemCardContent>
                </MenuItemCard>
                <MenuButtonItem onClick={props.logout}>
                  <MenuIcon><MdLogout /></MenuIcon>
                  <MenuLabel>ログアウト</MenuLabel>
                </MenuButtonItem>
              </MenuSection>
              {menuLinks
                .filter(menuLink =>
                  (menuLink.requireCommonRole === null || (props.commonRole ?? 0) >= menuLink.requireCommonRole) &&
                  (menuLink.requireSystemRole === null || (props.systemRole ?? 0) >= menuLink.requireSystemRole))
                .map((menuLink, index) => (
                  <MenuSection key={index}>
                    {menuLink.sectionName && (
                      <MenuSectionTitle>{menuLink.sectionName}</MenuSectionTitle>
                    )}
                    <MenuItemRack>
                      {menuLink.items.map((item, index) => (
                        <MenuLinkItem key={index} to={item.to} onClick={props.closeMenu}>
                          <MenuIcon>{item.icon}</MenuIcon>
                          <MenuLabel>{item.label}</MenuLabel>
                        </MenuLinkItem>
                      ))}
                    </MenuItemRack>
                  </MenuSection>
                ))}
            </>
          )}
        </MenuWrap>
      </Container>
      : <></>
  )
}

export default Sidebar

const Container = styled.div`
`
const MenuWrap = styled.div`
  padding: 10px;
`
const MenuSection = styled.div`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`
const MenuSectionTitle = styled.div`
  margin-bottom: 5px;
  font-size: 0.8em;
  color: var(--text-light-color);
`
const MenuItemRack = styled.div`
  display: flex;
  flex-direction: column;
`
const menuItemStyle = css`
  padding: 5px;
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 5px;
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover {
    background-color: var(--background-light2-color);
  }
`
const MenuLinkItem = styled(Link)`
  ${menuItemStyle}
  color: inherit;
  text-decoration: inherit;
`
const MenuButtonItem = styled.button`
  ${menuItemStyle}
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;
  background-color: inherit;
  border: inherit;
  cursor: pointer;
`
const MenuIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 24px;
    height: 24px;
  }
`
const MenuLabel = styled.div``
const MenuItemCard = styled.div`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  padding: 10px;
  border: 1px solid var(--outline-color);
  border-radius: 5px;
`
const MenuItemCardTitle = styled.div`
  font-size: 0.8em;
`
const MenuItemCardContent = styled.div`
  font-weight: bold;
  font-size: 0.9em;
`
