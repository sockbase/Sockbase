import { useCallback } from 'react'
import styled from 'styled-components'
import sockbaseShared from 'shared'
import FormButton from '../../components/Form/FormButton'
import PageTitle from '../../components/Parts/PageTitle'
import Section from '../../components/Parts/Section'
import SectionBody from '../../components/Parts/SectionBody'
import SectionTitle from '../../components/Parts/SectionTitle'
import envHelper from '../../helpers/envHelper'
import useFirebase from '../../hooks/useFirebase'
import useModal from '../../hooks/useModal'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const SettingsPage: React.FC = () => {
  const { user, roles, logoutAsync } = useFirebase()
  const { showModalAsync } = useModal()

  const handleLogout = useCallback(() => {
    showModalAsync({ title: 'ログアウト', children: 'ログアウトしますか？', type: 'confirm' })
      .then(() => {
        logoutAsync()
          .then(() => showModalAsync({ title: 'ログアウト', children: 'ログアウトしました', type: 'alert' }))
      })
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
            v{envHelper.version}.{envHelper.buildNumber}
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>ログアウト</SectionTitle>
          <SectionBody>
            {user
              ? (
                <FormButton onClick={handleLogout}>ログアウト</FormButton>
              )
              : '未ログイン'}
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
