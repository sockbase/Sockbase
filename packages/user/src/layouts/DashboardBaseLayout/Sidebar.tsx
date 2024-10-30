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

interface MenuSection {
  sectionKey: string
  sectionName: string | null
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
    sectionName: '設定',
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
    <StyledSidebarContainer>
      {!isHideToggleMenu && <StyledSection isSlim={isSlim}>
        <StyledMenu>
          {
            !isOpenMenu
              ? <StyledMenuItem onClick={() => setOpenMenu(true)}>
                <StyledMenuItemIcon isSlim={isSlim}><MdMenu /></StyledMenuItemIcon>
                {!isSlim && <StyledMenuItemText>メニュー</StyledMenuItemText>}
              </StyledMenuItem>
              : <StyledMenuItem onClick={() => setOpenMenu(false)}>
                <StyledMenuItemIcon isSlim={isSlim}><MdClose /></StyledMenuItemIcon>
                {!isSlim && <StyledMenuItemText>閉じる</StyledMenuItemText>}
              </StyledMenuItem>
          }
        </StyledMenu>
      </StyledSection>}
      {
        (isHideToggleMenu || (!isHideToggleMenu && isOpenMenu)) &&
        <>
          {!isSlim && <StyledStatePanel>
            <StyledStatePanelTitle>ログイン中ユーザー</StyledStatePanelTitle>
            <StyledStatePanelContent>{props.user.email}</StyledStatePanelContent>
          </StyledStatePanel>}
          {menu
            .map(sec => <StyledSection key={sec.sectionKey} isSlim={isSlim}>
              {!isSlim && sec.sectionName && <StyledSectionHeader>{sec.sectionName}</StyledSectionHeader>}
              <StyledMenu>
                {
                  sec.items
                    .map(item =>
                      <StyledMenuItemLink key={item.key} to={item.link} onClick={() => setOpenMenu(false)}>
                        <StyledMenuItemIcon isSlim={isSlim} isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.icon}</StyledMenuItemIcon>
                        {!isSlim && <StyledMenuItemText isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.text}</StyledMenuItemText>}
                      </StyledMenuItemLink>
                    )
                }
              </StyledMenu>
            </StyledSection>)}
          <StyledSection isSlim={isSlim}>
            <StyledMenu>
              <StyledMenuItem onClick={props.logout}>
                <StyledMenuItemIcon isSlim={isSlim}><MdLogout /></StyledMenuItemIcon>
                {!isSlim && <StyledMenuItemText>ログアウト</StyledMenuItemText>}
              </StyledMenuItem>
            </StyledMenu>
          </StyledSection>
          {isHideToggleMenu && <StyledSection isSlim={isSlim}>
            <StyledMenu>
              <StyledMenuItem onClick={() => props.setSlim(!props.isSlim)}>
                <StyledMenuItemIcon isSlim={isSlim}>
                  {isSlim ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
                </StyledMenuItemIcon>
                {!isSlim && <StyledMenuItemText>メニュー最小化</StyledMenuItemText>}
              </StyledMenuItem>
            </StyledMenu>
          </StyledSection>}
        </>}
    </StyledSidebarContainer >
  )
}

const StyledSidebarContainer = styled.nav``
const StyledSection = styled.section<{ isSlim: boolean }>`
  margin-bottom: 10px;
  ${props => props.isSlim && {
    marginBottom: '15px'
  }}

  &:last-child {
    margin-bottom: 0;
  }
`
const StyledSectionHeader = styled.div`
  margin-bottom: 5px;
  font-size: 0.8em;
  color: var(--text-light-color);
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
const StyledMenuItemIcon = styled.span<{ isImportant?: boolean, isDisabled?: boolean, isSlim: boolean }>`
  padding: 10px;
  border-radius: 5px 0 0 5px;
  border-right: none;
  color: var(--text-color);
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
        backgroundColor: 'var(--danger-color)',
        color: 'var(--text-foreground-color)'
      }
      : {
        backgroundColor: 'var(--background-light-color)'
      }}

  ${prpos => prpos.isSlim && {
    borderRadius: '5px'
  }}
`
const StyledMenuItemText = styled.span<{ isImportant?: boolean, isDisabled?: boolean }>`
  padding: 10px;
  background-color: var(--background-light2-color);
  border-radius: 0 5px 5px 0;
  border-left: none;

  // Webkitで閲読済みリンクに意図しない枠線が入る対策
  // https://stackoverflow.com/questions/11207857/border-appearing-the-text-color-of-an-anchor-on-google-chrome
  &,
  *:visited & {
    ${props => props.isDisabled
    ? {
      backgroundColor: 'var(--background-disabled-color)',
      color: 'var(--text-disabled-color)'
    }
    : props.isImportant
      ? {
        color: 'var(--danger-color)',
        fontWeight: 'bold'
      }
      : {
        color: 'var(--text-color)'
      }}
  }
`
const StyledStatePanel = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: var(--background-light2-color);

  margin-bottom: 10px;
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
