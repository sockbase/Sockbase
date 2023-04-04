import React from 'react'
import styled from 'styled-components'
import {
  MdLogin,
  MdMail,
  MdDashboard,
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
import { Link } from 'react-router-dom'

interface MenuSection {
  sectionKey: string
  sectionName: string
  items: MenuItem[]
}
interface MenuItem {
  key: string
  icon: React.ReactNode
  text: string
  link: string
  isImportant?: boolean
}
const menu: MenuSection[] = [
  {
    sectionKey: 'developments',
    sectionName: '開発用',
    items: [
      {
        key: 'firebaseLogin',
        icon: <MdLogin />,
        text: 'Firebaseログインテスト',
        link: '/'
      },
      {
        key: 'formTemplate',
        icon: <MdMail />,
        text: 'フォームテンプレート',
        link: '/formTemplate'
      },
      {
        key: 'dashboardTemplate',
        icon: <MdDashboard />,
        text: 'ダッシュボードテンプレート',
        link: '/dashboardTemplate'
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
        text: 'マイチケット',
        link: '',
        isImportant: true
      },
      {
        key: 'ticketHistories',
        icon: <MdAccountBalanceWallet />,
        text: 'チケット申し込み履歴',
        link: ''
      },
      {
        key: 'circleHistories',
        icon: <MdEditNote />,
        text: 'サークル申し込み履歴',
        link: ''
      },
      {
        key: 'paymentHistories',
        icon: <MdPayments />,
        text: '決済履歴',
        link: ''
      },
      {
        key: 'settings',
        icon: <MdSettings />,
        text: 'マイページ設定',
        link: ''
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
        text: 'チケット照会ターミナル',
        link: ''
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
        text: '横断検索',
        link: ''
      },
      {
        key: 'manageEvents',
        icon: <MdEditCalendar />,
        text: 'イベント管理',
        link: ''
      },
      {
        key: 'manageStores',
        icon: <MdStore />,
        text: 'チケットストア管理',
        link: ''
      }
    ]
  }
]

const Sidebar: React.FC = (props) => {
  return (
    <StyledSidebarContainer>
      {menu.map(sec => <StyledSection key={sec.sectionKey}>
        {sec.sectionName && <StyledSectionHeader>{sec.sectionName}</StyledSectionHeader>}
        <StyledMenu>
          {
            sec.items.map(item =>
              <StyledMenuItem key={item.key} to={item.link}>
                <StyledMenuItemIcon isImportant={item.isImportant}>{item.icon}</StyledMenuItemIcon>
                <StyledMenuItemText isImportant={item.isImportant}>{item.text}</StyledMenuItemText>
              </StyledMenuItem>
            )
          }
        </StyledMenu>
      </StyledSection>)}
    </StyledSidebarContainer>
  )
}

const StyledSidebarContainer = styled.nav``
const StyledSection = styled.section`
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
const StyledMenu = styled.section``
const StyledMenuItem = styled(Link)`
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
const StyledMenuItemIcon = styled.div<{ isImportant?: boolean }>`
  padding: 10px;
  border-radius: 5px 0 0 5px;
  border-right: none;
  color: #ffffff;
  text-align: center;
  font-size: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.isImportant
    ? {
      backgroundColor: '#bf4040',
      border: '2px solid #bf4040'
    }
    : {
      backgroundColor: '#ea6183',
      border: '2px solid #ea6183'
    }
  }
`
const StyledMenuItemText = styled.div<{ isImportant?: boolean }>`
  padding: 10px;
  background-color: #f8f8f8;
  color: #000000;
  border-radius: 0 5px 5px 0;
  border-left: none;

  ${props => props.isImportant
    ? {
      backgroundColor: '#ffffff',
      border: '2px solid #bf4040',
      color: '#bf4040',
      fontWeight: 'bold'
    }
    : {
      border: '2px solid #ea6183'
    }
  }
`

export default Sidebar
