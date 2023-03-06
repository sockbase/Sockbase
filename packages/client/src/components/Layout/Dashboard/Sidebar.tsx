import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import {
  MdMenu,
  MdClose,
  MdHome,
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

import useWindowDimension from '../../../hooks/useWindowDimension'

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
  isDisabled?: boolean
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
        link: '',
        isImportant: true,
        isDisabled: true
      },
      {
        key: 'circleHistories',
        icon: <MdEditNote />,
        text: 'サークル申し込み履歴',
        link: '/dashboard/applications'
      },
      {
        key: 'ticketHistories',
        icon: <MdAccountBalanceWallet />,
        text: 'チケット申し込み履歴',
        link: '',
        isDisabled: true
      },
      {
        key: 'paymentHistories',
        icon: <MdPayments />,
        text: '決済履歴',
        link: '',
        isDisabled: true
      },
      {
        key: 'settings',
        icon: <MdSettings />,
        text: 'マイページ設定',
        link: '',
        isDisabled: true
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
        link: '',
        isDisabled: true
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
        link: '',
        isDisabled: true
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
        link: '',
        isDisabled: true
      }
    ]
  }
]

const Sidebar: React.FC = (props) => {
  const { width } = useWindowDimension()
  const [isActiveToggleMenu, setActiveToggleMenu] = useState(false)
  const [isOpenMenu, setOpenMenu] = useState(false)

  const onChangeWidth: () => void =
    () => setActiveToggleMenu(width < 840)
  useEffect(onChangeWidth, [width])

  return (
    <StyledSidebarContainer>
      {isActiveToggleMenu && <StyledMenu>
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
      </StyledMenu>}
      {
        (!isActiveToggleMenu || (isActiveToggleMenu && isOpenMenu)) && menu.map(sec => <StyledSection key={sec.sectionKey}>
          {sec.sectionName && <StyledSectionHeader>{sec.sectionName}</StyledSectionHeader>}
          <StyledMenu>
            {
              sec.items.map(item =>
                <StyledMenuItemLink key={item.key} to={item.link}>
                  <StyledMenuItemIcon isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.icon}</StyledMenuItemIcon>
                  <StyledMenuItemText isImportant={item.isImportant} isDisabled={item.isDisabled}>{item.text}</StyledMenuItemText>
                </StyledMenuItemLink>
              )
            }
          </StyledMenu>
        </StyledSection>)
      }
    </StyledSidebarContainer >
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
const StyledMenuItemIcon = styled.div<{ isImportant?: boolean, isDisabled?: boolean }>`
  padding: 10px;
  border-radius: 5px 0 0 5px;
  border-right: none;
  color: #ffffff;
  text-align: center;
  font-size: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.isDisabled
    ? {
      backgroundColor: '#808080',
      border: '2px solid #808080'
    }
    : props.isImportant
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
const StyledMenuItemText = styled.div<{ isImportant?: boolean, isDisabled?: boolean }>`
  padding: 10px;
  background-color: #f8f8f8;
  color: #000000;
  border-radius: 0 5px 5px 0;
  border-left: none;

  ${props => props.isDisabled
    ? {
      backgroundColor: '#c0c0c0',
      border: '2px solid #808080',
      color: '#808080'
    }
    : props.isImportant
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
