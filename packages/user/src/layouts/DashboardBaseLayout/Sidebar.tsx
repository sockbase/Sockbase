import { useEffect, useMemo, useState } from 'react'
import {
  MdMenu,
  MdClose,
  MdLogout,
  MdHome,
  MdLocalActivity,
  MdEditSquare,
  MdPayments,
  MdSettings,
  MdMail,
  MdWallet,
  MdArrowBackIosNew,
  MdArrowForwardIos
} from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import useWindowDimension from '../../hooks/useWindowDimension'
import type { User } from 'firebase/auth'
import type { SockbaseRole } from 'sockbase'

interface MenuItemType {
  key: string
  icon: React.ReactNode
  text: string
  link: string
  isImportant?: boolean
  isDisabled?: boolean
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
interface MenuSection {
  sectionKey: string
  sectionName: string | null
  items: MenuItemType[]
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
const menu: MenuSection[] = [
  {
    sectionKey: 'home',
    sectionName: null,
    items: [
      {
        key: 'mypageHome',
        icon: <MdHome />,
        text: 'ホーム',
        link: '/dashboard'
      },
      {
        key: 'myTickets',
        icon: <MdLocalActivity />,
        text: 'マイチケット',
        link: '/dashboard/mytickets',
        isImportant: true
      }
    ]
  },
  {
    sectionKey: 'history',
    sectionName: '申し込み履歴',
    items: [
      {
        key: 'ticketList',
        icon: <MdWallet />,
        text: '購入済みチケット',
        link: '/dashboard/tickets'
      },
      {
        key: 'circleHistories',
        icon: <MdEditSquare />,
        text: '申込済みイベント',
        link: '/dashboard/applications'
      },
      {
        key: 'paymentHistories',
        icon: <MdPayments />,
        text: '決済履歴',
        link: '/dashboard/payments'
      }
    ]
  },
  {
    sectionKey: 'settings',
    sectionName: '設定・サポート',
    items: [
      {
        key: 'settings',
        icon: <MdSettings />,
        text: 'マイページ設定',
        link: '/dashboard/settings'
      },
      {
        key: 'contact',
        icon: <MdMail />,
        text: 'お問い合わせ',
        link: '/dashboard/contact'
      }
    ]
  }
]

interface Props {
  isSlim: boolean
  setSlim: (isSlim: boolean) => void
  user: User
  logout: () => void
}
const Sidebar: React.FC<Props> = (props) => {
  const { width } = useWindowDimension()

  const [isHideToggleMenu, setHideToggleMenu] = useState(false)
  const [isOpenMenu, setOpenMenu] = useState(false)

  const isSlim = useMemo(() => isHideToggleMenu && props.isSlim, [isHideToggleMenu, props.isSlim])

  useEffect(() => setHideToggleMenu(width > 840), [width])

  return (
    <Container>
      {!isHideToggleMenu && <Section isSlim={isSlim}>
        <Menu>
          {
            !isOpenMenu
              ? <MenuItem onClick={() => setOpenMenu(true)}>
                <MenuItemIcon isSlim={isSlim}><MdMenu /></MenuItemIcon>
                {!isSlim && <MenuItemText>メニュー</MenuItemText>}
              </MenuItem>
              : <MenuItem onClick={() => setOpenMenu(false)}>
                <MenuItemIcon isSlim={isSlim}><MdClose /></MenuItemIcon>
                {!isSlim && <MenuItemText>閉じる</MenuItemText>}
              </MenuItem>
          }
        </Menu>
      </Section>}
      {
        (isHideToggleMenu || (!isHideToggleMenu && isOpenMenu)) &&
        <>
          {!isSlim && <StatePanel>
            <StatePanelTitle>ログイン中ユーザー</StatePanelTitle>
            <StatePanelContent>{props.user.email}</StatePanelContent>
          </StatePanel>}
          {menu
            .map(sec => <Section key={sec.sectionKey} isSlim={isSlim}>
              {!isSlim && sec.sectionName && <SectionHeader>{sec.sectionName}</SectionHeader>}
              <Menu>
                {
                  sec.items
                    .map(item =>
                      <MenuItemLink
                        key={item.key}
                        to={item.link}
                        onClick={() => setOpenMenu(false)}
                        $isImportant={item.isImportant}
                        $isDisabled={item.isDisabled}>
                        <MenuItemIcon isSlim={isSlim}>{item.icon}</MenuItemIcon>
                        {!isSlim && (
                          <MenuItemText isDisabled={item.isDisabled}>
                            {item.text}
                          </MenuItemText>
                        )}
                      </MenuItemLink>
                    )
                }
              </Menu>
            </Section>)}
          <Section isSlim={isSlim}>
            <Menu>
              <MenuItem onClick={props.logout}>
                <MenuItemIcon isSlim={isSlim}><MdLogout /></MenuItemIcon>
                {!isSlim && <MenuItemText>ログアウト</MenuItemText>}
              </MenuItem>
            </Menu>
          </Section>
          {isHideToggleMenu && <Section isSlim={isSlim}>
            <Menu>
              <MenuItem onClick={() => props.setSlim(!props.isSlim)}>
                <MenuItemIcon isSlim={isSlim}>
                  {isSlim ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
                </MenuItemIcon>
                {!isSlim && <MenuItemText>メニュー最小化</MenuItemText>}
              </MenuItem>
            </Menu>
          </Section>}
        </>}
    </Container >
  )
}

const Container = styled.nav``
const Section = styled.section<{ isSlim: boolean }>`
  margin-bottom: 10px;
  ${props => props.isSlim && {
    marginBottom: '15px'
  }}

  &:last-child {
    margin-bottom: 0;
  }
`
const SectionHeader = styled.div`
  margin-bottom: 5px;
  font-size: 0.8em;
  color: var(--text-light-color);
`
const Menu = styled.section`
`
const MenuItemStyle = css<{ $isDisabled?: boolean, $isImportant?: boolean }>`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
  display: grid;
  grid-template-columns: 48px 1fr;
  text-decoration: none;
  cursor: pointer;
  background-color: var(--sidebar-menu-item-background-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;

  transition: border 0.2s;

  &:hover {
    border: 1px solid var(--brand-color);
  }

  ${props => props.$isDisabled && `
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
  `}

  ${props => props.$isImportant && `
    color: var(--danger-color);
    font-weight: bold;
  `}
`
const MenuItem = styled.span`
  ${MenuItemStyle}
`
const MenuItemLink = styled(Link)`
  ${MenuItemStyle}
`
const MenuItemIcon = styled.span<{ isSlim: boolean }>`
  padding: 10px;
  
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1.5em;
    height: 1.5em;
  }

  ${prpos => prpos.isSlim && `
    border-radius: 5px;
  `}
`
const MenuItemText = styled.span<{ isDisabled?: boolean }>`
  padding: 10px 0;
`
const StatePanel = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: var(--sidebar-menu-item-background-color);
  border: 1px solid var(--outline-color);

  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`
const StatePanelTitle = styled.div`
  font-size: 0.9em;
`
const StatePanelContent = styled.div`
  font-weight: bold;
`
export default Sidebar
