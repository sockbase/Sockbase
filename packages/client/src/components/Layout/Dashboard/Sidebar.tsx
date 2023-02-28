import React from 'react'
import styled from 'styled-components'
import {
  MdHome,
  MdLogout,
  MdLocalActivity,
  MdAccountBalanceWallet,
  MdEditNote,
  MdPayments,
  MdSettings,
  MdQrCodeScanner,
  MdManageSearch,
  MdEditCalendar,
  MdStore
} from 'react-icons/md'

interface MenuSection {
  sectionKey: string
  sectionName: string
  items: MenuItem[]
}
interface MenuItem {
  key: string
  icon: React.ReactNode
  text: string
}
const menu: MenuSection[] = [
  {
    sectionKey: 'general',
    sectionName: '',
    items: [
      {
        key: 'mypageTop',
        icon: <MdHome />,
        text: 'マイページトップ'
      },
      {
        key: 'logout',
        icon: <MdLogout />,
        text: 'ログアウト'
      }
    ]
  },
  {
    sectionKey: 'mypage',
    sectionName: 'マイページ',
    items: [
      {
        key: 'myTickets',
        icon: <MdLocalActivity />,
        text: 'マイチケット'
      },
      {
        key: 'ticketHistories',
        icon: <MdAccountBalanceWallet />,
        text: 'チケット申込み履歴'
      },
      {
        key: 'circleHistories',
        icon: <MdEditNote />,
        text: 'サークル申込み履歴'
      },
      {
        key: 'paymentHistories',
        icon: <MdPayments />,
        text: '決済履歴'
      },
      {
        key: 'settings',
        icon: <MdSettings />,
        text: 'マイページ設定'
      }
    ]
  },
  {
    sectionKey: 'support',
    sectionName: 'イベント開催支援',
    items: [
      {
        key: 'terminal',
        icon: <MdQrCodeScanner />,
        text: 'チケット照会ターミナル'
      }
    ]
  },
  {
    sectionKey: 'system',
    sectionName: 'システム操作',
    items: [
      {
        key: 'omnisearch',
        icon: <MdManageSearch />,
        text: '横断検索'
      },
      {
        key: 'manageEvents',
        icon: <MdEditCalendar />,
        text: 'イベント管理'
      },
      {
        key: 'manageStores',
        icon: <MdStore />,
        text: 'チケットストア管理'
      }
    ]
  }
]

const Sidebar: React.FC = (props) => {
  return (
    <StyledSidebarContainer>
      {menu.map(i => <StyledSection key={i.sectionKey}>
        {i.sectionName && <StyledSectionHeader>{i.sectionName}</StyledSectionHeader>}
        {
          i.items.map(i => <StyledMenu key={i.key}>
            <StyledMenuItem>
              <StyledMenuItemIcon>{i.icon}</StyledMenuItemIcon>
              <StyledMenuItemText>{i.text}</StyledMenuItemText>
            </StyledMenuItem>
          </StyledMenu>)
        }
      </StyledSection>)}
    </StyledSidebarContainer>
  )
}

const StyledSidebarContainer = styled.div``
const StyledSection = styled.div`
  margin-bottom: 10px;
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
  color: #000000;
  &::after {
    display: none;
  }
`
const StyledMenu = styled.div``
const StyledMenuItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  margin-bottom: 5px;
  &:last-child {
    margin-bototm: 0;
  }

  cursor: pointer;
`
const StyledMenuItemIcon = styled.div`
  padding: 10px;
  border-radius: 5px 0 0 5px;
  background-color: #ea6183;
  border: 2px solid #ea6183;
  border-right: none;
  color: #ffffff;
  text-align: center;
  font-size: 24px;

  display: flex;
  align-items: center;
  justify-content: center;
`
const StyledMenuItemText = styled.div`
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 0 5px 5px 0;
  border: 2px solid #ea6183;
  border-left: none;
`

export default Sidebar
