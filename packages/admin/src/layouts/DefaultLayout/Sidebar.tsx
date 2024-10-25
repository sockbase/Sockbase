import { MdBadge, MdEditCalendar, MdHome, MdInbox, MdInfo, MdLogin, MdLogout, MdQrCodeScanner, MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import type { User } from 'firebase/auth'
import type { SockbaseRole } from 'sockbase'

interface Props {
  showMenu: boolean
  user: User | null | undefined
  commonRole: SockbaseRole | null | undefined
  systemRole: SockbaseRole | null | undefined
  logout: () => void
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
              {(props.commonRole ?? 0) >= 1 && (
                <>
                  <MenuSection>
                    <MenuItemRack>
                      <MenuLinkItem to="/">
                        <MenuIcon><MdHome /></MenuIcon>
                        <MenuLabel>ホーム</MenuLabel>
                      </MenuLinkItem>
                      <MenuLinkItem to="/license">
                        <MenuIcon><MdBadge /></MenuIcon>
                        <MenuLabel>権限</MenuLabel>
                      </MenuLinkItem>
                    </MenuItemRack>
                  </MenuSection>
                  <MenuSection>
                    <MenuSectionTitle>入場管理</MenuSectionTitle>
                    <MenuItemRack>
                      <MenuLinkItem to="/tickets/terminal">
                        <MenuIcon><MdQrCodeScanner /></MenuIcon>
                        <MenuLabel>チケット照会ターミナル</MenuLabel>
                      </MenuLinkItem>
                    </MenuItemRack>
                  </MenuSection>
                </>
              )}
              {(props.systemRole ?? 0) >= 2 && (<>
                <MenuSection>
                  <MenuSectionTitle>イベント管理</MenuSectionTitle>
                  <MenuItemRack>
                    <MenuLinkItem to="/events">
                      <MenuIcon><MdEditCalendar /></MenuIcon>
                      <MenuLabel>イベント管理</MenuLabel>
                    </MenuLinkItem>
                    <MenuLinkItem to="/stores">
                      <MenuIcon><MdStore /></MenuIcon>
                      <MenuLabel>チケットストア管理</MenuLabel>
                    </MenuLinkItem>
                  </MenuItemRack>
                </MenuSection>
                <MenuSection>
                  <MenuSectionTitle>システム管理</MenuSectionTitle>
                  <MenuItemRack>
                    <MenuLinkItem to="/inquiries">
                      <MenuIcon><MdInbox /></MenuIcon>
                      <MenuLabel>問い合わせ管理</MenuLabel>
                    </MenuLinkItem>
                    <MenuLinkItem to="/informations">
                      <MenuIcon><MdInfo /></MenuIcon>
                      <MenuLabel>お知らせ管理</MenuLabel>
                    </MenuLinkItem>
                  </MenuItemRack>
                </MenuSection>
              </>)}
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
