import { useCallback } from 'react'
import styled from 'styled-components'
import sockbaseShared from 'shared'
import PageTitle from '../../components/Parts/PageTitle'
import Section from '../../components/Parts/Section'
import SectionBody from '../../components/Parts/SectionBody'
import SectionTitle from '../../components/Parts/SectionTitle'
import useFirebase from '../../hooks/useFirebase'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const SettingsPage: React.FC = () => {
  const { user, roles, logoutAsync } = useFirebase()

  const handleLogout = useCallback(() => {
    logoutAsync()
  }, [])

  return (
    <DefaultLayout>
      <PageTitle>設定</PageTitle>
      <Container>
        <Section>
          <SectionTitle>メールアドレス</SectionTitle>
          <SectionBody>
            {user !== undefined
              ? user?.email ?? '未ログイン'
              : '認証中'}
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>ユーザ ID</SectionTitle>
          <SectionBody>
            {user !== undefined
              ? user?.uid ?? '未ログイン'
              : '認証中'}
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>組織情報</SectionTitle>
          <SectionBody>
            <ul>
              {roles && Object.entries(roles).map(([k, v]) => (
                <li key={k}>
                  {k === 'system' ? 'システム管理' : k}: {sockbaseShared.constants.user.roleText[v]} (アクセスレベル: {v})
                </li>
              ))}
            </ul>
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>ビルド番号</SectionTitle>
          <SectionBody>
            v2024.12.0.1000
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>ログアウト</SectionTitle>
          <SectionBody>
            {user ? <button onClick={handleLogout}>ログアウト</button> : '未ログイン'}
          </SectionBody>
        </Section>
      </Container>
    </DefaultLayout>
  )
}

export default SettingsPage

const Container = styled.div`
  padding: 20px;
`
