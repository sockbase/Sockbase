import { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { useNavigate } from 'react-router-dom'
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

import useNotification from '../../../hooks/useNotification'
import useModal from '../../../hooks/useModal'
import FormSection from '../../Form/FormSection'
import FormItem from '../../Form/FormItem'
import FormButton from '../../Form/FormButton'

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const { showModal, closeModal } = useModal()

  const handleConfirmLogout = useCallback((): void => {
    showModal(
      'ログアウト操作',
      <>
        Sockbase 管理パネルからログアウトします。<br />
        よろしいですか？
      </>,
      [
        <FormSection>
          <FormItem inlined right>
            <FormButton onClick={handleLogout} color="danger">ログアウト</FormButton>
            <FormButton onClick={closeModal}>やめる</FormButton>
          </FormItem>
        </FormSection>
      ])
  }, [showModal, closeModal])

  const handleLogout = useCallback((): void => {
    closeModal()
    addNotification('ログアウトしました')
  }, [])

  const handleTransition = useCallback((link: string): void => {
    navigate(link)
  }, [])

  return (
    <Container>
      <Card>
        <CardTitle>ログイン中ユーザ</CardTitle>
        <CardContent>xxx@sockbase.net</CardContent>
      </Card>

      <Menu>
        <MenuItemButton onClick={() => handleTransition('/login')}>
          <MenuItemIcon>
            <MdLogin />
          </MenuItemIcon>
          <MenuItemLabel>ログイン</MenuItemLabel>
        </MenuItemButton>
        <MenuItemButton onClick={handleConfirmLogout}>
          <MenuItemIcon>
            <MdLogout />
          </MenuItemIcon>
          <MenuItemLabel>ログアウト</MenuItemLabel>
        </MenuItemButton>
      </Menu>

      <Menu>
        <MenuItemButton onClick={() => handleTransition('/')}>
          <MenuItemIcon>
            <MdHome />
          </MenuItemIcon>
          <MenuItemLabel>トップ</MenuItemLabel>
        </MenuItemButton>
      </Menu>

      <MenuTitle>イベント開催支援</MenuTitle>
      <Menu>
        <MenuItemButton onClick={() => handleTransition('')}>
          <MenuItemIcon>
            <MdQrCodeScanner />
          </MenuItemIcon>
          <MenuItemLabel>チケット照会ターミナル</MenuItemLabel>
        </MenuItemButton>
        <MenuItemButton onClick={() => handleTransition('')}>
          <MenuItemIcon>
            <MdBadge />
          </MenuItemIcon>
          <MenuItemLabel>権限</MenuItemLabel>
        </MenuItemButton>
      </Menu>

      <MenuTitle>システム操作</MenuTitle>
      <Menu>
        <MenuItemButton onClick={() => handleTransition('')}>
          <MenuItemIcon>
            <MdInbox />
          </MenuItemIcon>
          <MenuItemLabel>問い合わせ管理</MenuItemLabel>
        </MenuItemButton>
        <MenuItemButton onClick={() => handleTransition('')}>
          <MenuItemIcon>
            <MdEditCalendar />
          </MenuItemIcon>
          <MenuItemLabel>イベント管理</MenuItemLabel>
        </MenuItemButton>
        <MenuItemButton onClick={() => handleTransition('')}>
          <MenuItemIcon>
            <MdStore />
          </MenuItemIcon>
          <MenuItemLabel>チケットストア管理</MenuItemLabel>
        </MenuItemButton>
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
  border: none;
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
const MenuItemButton = styled.button`
  ${MenuItemLinkMixin}
  font: inherit;
  text-align: inherit;
  color: inherit;
`
