import { useEffect, useState } from 'react'
import {
  MdMenu,
  MdClose,
  MdLogout,
  MdHome,
  MdLocalActivity,
  MdEditSquare,
  MdPayments,
  MdSettings,
  MdQrCodeScanner,
  MdEditCalendar,
  MdStore,
  MdMail,
  MdInbox,
  MdWallet,
  MdBadge,
  MdSearch
} from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import sockbaseShared from 'shared'
import useRole from '../../../hooks/useRole'
import useWindowDimension from '../../../hooks/useWindowDimension'
import type { User } from 'firebase/auth'
import type { SockbaseRole } from 'sockbase'

interface MenuSection {
  sectionKey: string
  sectionName: string
  items: MenuItem[]
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
interface MenuItem {
  key: string
  icon: React.ReactNode
  text: string
  link: string
  isImportant?: boolean
  isDisabled?: boolean
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
const menu: MenuSection[] = [
  {
    sectionKey: 'mypage',
    sectionName: 'マイページ',
    items: [
      {
        key: 'mypageHome',
        icon: <MdHome />,
        text: 'マイページホーム',
        link: '/dashboard'
      },
      {
        key: 'myTickets',
        icon: <MdLocalActivity />,
        text: 'マイチケット',
        link: '/dashboard/mytickets',
        isImportant: true
      },
      {
        key: 'ticketList',
        icon: <MdWallet />,
        text: '購入済みチケット一覧',
        link: '/dashboard/tickets'
      },
      {
        key: 'circleHistories',
        icon: <MdEditSquare />,
        text: 'サークル申し込み履歴',
        link: '/dashboard/applications'
      },
      {
        key: 'paymentHistories',
        icon: <MdPayments />,
        text: '決済履歴',
        link: '/dashboard/payments'
      },
      {
        key: 'contact',
        icon: <MdMail />,
        text: 'お問い合わせ',
        link: '/dashboard/contact'
      },
      {
        key: 'settings',
        icon: <MdSettings />,
        text: 'マイページ設定',
        link: '/dashboard/settings'
      }
    ]
  },
  {
    sectionKey: 'support',
    sectionName: 'イベント開催支援',
    requireCommonRole: sockbaseShared.enumerations.user.permissionRoles.staff,
    items: [
      {
        key: 'terminal',
        icon: <MdQrCodeScanner />,
        text: 'チケット照会ターミナル',
        link: '/dashboard/tickets/terminal'
      },
      {
        key: 'license',
        icon: <MdBadge />,
        text: '権限',
        link: '/dashboard/license'
      }
    ]
  },
  {
    sectionKey: 'event',
    sectionName: 'イベント管理',
    requireCommonRole: sockbaseShared.enumerations.user.permissionRoles.admin,
    items: [
      {
        key: 'omnisearch',
        icon: <MdSearch />,
        text: '検索',
        link: '/dashboard/search'
      },
      {
        key: 'manageEvents',
        icon: <MdEditCalendar />,
        text: 'イベント管理',
        link: '/dashboard/events'
      },
      {
        key: 'manageStores',
        icon: <MdStore />,
        text: 'チケットストア管理',
        link: '/dashboard/stores'
      }
    ]
  },
  {
    sectionKey: 'system',
    sectionName: 'システム操作',
    requireSystemRole: sockbaseShared.enumerations.user.permissionRoles.admin,
    items: [
      {
        key: 'manageInquiries',
        icon: <MdInbox />,
        text: '問い合わせ管理',
        link: '/dashboard/inquiries'
      }
    ]
  }
]

interface Props {
  user: User
  logout: () => void
}
const Sidebar: React.FC<Props> = (props) => {
  const { width } = useWindowDimension()
  const { systemRole, commonRole } = useRole()

  const [isHideToggleMenu, setHideToggleMenu] = useState(false)
  const [isOpenMenu, setOpenMenu] = useState(false)

  const onChangeWidth: () => void =
    () => setHideToggleMenu(width >= 840)
  useEffect(onChangeWidth, [width])

  return (
    <StyledSidebarContainer>
      {!isHideToggleMenu && <StyledSection>
        <StyledMenu>
          {
            !isOpenMenu
              ? <StyledMenuItem onClick={() => setOpenMenu(true)}>
                <StyledMenuItemIcon><MdMenu /></StyledMenuItemIcon>
                <StyledMenuItemText>メニュー</StyledMenuItemText>
              </StyledMenuItem>
              : <StyledMenuItem onClick={() => setOpenMenu(false)}>
                <StyledMenuItemIcon><MdClose /></StyledMenuItemIcon>
                <StyledMenuItemText>閉じる</StyledMenuItemText>
              </StyledMenuItem>
          }
        </StyledMenu>
      </StyledSection>}
      {
        (isHideToggleMenu || (!isHideToggleMenu && isOpenMenu)) &&
        <>
          <StyledStatePanel>
            <StyledStatePanelTitle>ログイン中ユーザー</StyledStatePanelTitle>
            <StyledStatePanelContent>{props.user.email}</StyledStatePanelContent>
          </StyledStatePanel>
          <StyledSection>
            <StyledMenu>
              <StyledMenuItem onClick={props.logout}>
                <StyledMenuItemIcon><MdLogout /></StyledMenuItemIcon>
                <StyledMenuItemText>ログアウト</StyledMenuItemText>
              </StyledMenuItem>
            </StyledMenu>
          </StyledSection>
          {menu
            .filter(m =>
              (!m.requireCommonRole || m.requireCommonRole <= (commonRole ?? 0)) &&
              (!m.requireSystemRole || m.requireSystemRole <= (systemRole ?? 0)))
            .map(sec => <StyledSection key={sec.sectionKey}>
              {sec.sectionName && <StyledSectionHeader>{sec.sectionName}</StyledSectionHeader>}
              <StyledMenu>
                {
                  sec.items
                    .filter(m =>
                      (!m.requireCommonRole || m.requireCommonRole <= (commonRole ?? 0)) &&
                      (!m.requireSystemRole || m.requireSystemRole <= (systemRole ?? 0)))
                    .map(item =>
                      <StyledMenuItemLink key={item.key} to={item.link}>
                        <StyledMenuItemIcon isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.icon}</StyledMenuItemIcon>
                        <StyledMenuItemText isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.text}</StyledMenuItemText>
                      </StyledMenuItemLink>
                    )
                }
              </StyledMenu>
            </StyledSection>)}
        </>}
    </StyledSidebarContainer >
  )
}

const StyledSidebarContainer = styled.nav``
const StyledSection = styled.section`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
`
const StyledSectionHeader = styled.h2`
  display: block;
  margin: 0;
  margin-bottom: 5px;
  padding: 0;
  border-bottom: none;
  font-size: 1em;
  color: var(--text-color);
  &::after {
    display: none;
  }
`
const StyledMenu = styled.section`
`
const styledMenuItemStyle = css`
  display: grid;
  grid-template-columns: 48px 1fr;
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover {
    text-decoration: none;
  }
  cursor: pointer;
`

const StyledMenuItem = styled.span`
  ${styledMenuItemStyle}
`
const StyledMenuItemLink = styled(Link)`
  ${styledMenuItemStyle}
`
const StyledMenuItemIcon = styled.span<{ isImportant?: boolean, isDisabled?: boolean }>`
  padding: 10px;
  border-radius: 5px 0 0 5px;
  border-right: none;
  color: var(--text-foreground-color);
  text-align: center;
  font-size: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.isDisabled
    ? {
      backgroundColor: 'var(--text-disabled-color)'
    }
    : props.isImportant
      ? {
        backgroundColor: 'var(--danger-color)'
      }
      : {
        backgroundColor: 'var(--primary-brand-color)'
      }}
`
const StyledMenuItemText = styled.span<{ isImportant?: boolean, isDisabled?: boolean }>`
  padding: 10px;
  background-color: var(--background-light-color);
  border-radius: 0 5px 5px 0;
  border-left: none;

  // Webkitで閲読済みリンクに意図しない枠線が入る対策
  // https://stackoverflow.com/questions/11207857/border-appearing-the-text-color-of-an-anchor-on-google-chrome
  &,
  *:visited & {
    ${props => props.isDisabled
    ? {
      backgroundColor: 'var(--background-disabled-color)',
      border: '2px solid var(--text-disabled-color)',
      color: 'var(--text-disabled-color)'
    }
    : props.isImportant
      ? {
        backgroundColor: 'var(--background-light-color)',
        border: '2px solid var(--danger-color)',
        color: 'var(--danger-color)',
        fontWeight: 'bold'
      }
      : {
        border: '2px solid var(--primary-brand-color)',
        color: 'var(--text-color)'
      }}
  }
`
const StyledStatePanel = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: var(--primary-brand-color);
  color: var(--text-foreground-color);

  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
`
const StyledStatePanelTitle = styled.div`
  font-size: 0.9em;
`
const StyledStatePanelContent = styled.div`
  font-weight: bold;
`
export default Sidebar
