import { useEffect, useState } from 'react'
import type { SockbaseAccount } from 'sockbase'

import { MdSettings } from 'react-icons/md'

import TwoColumnsLayout from '../../Layout/TwoColumns/TwoColumns'

import PageTitle from '../../Layout/Dashboard/PageTitle'
import FormSection from '../../Form/FormSection'
import FormItem from '../../Form/FormItem'
import FormLabel from '../../Form/Label'
import FormInput from '../../Form/Input'
import FormButton from '../../Form/Button'

interface Props {
  userData: SockbaseAccount
  updateUserData: () => void
}
const DashboardSettings: React.FC<Props> = (props) => {
  const [userData, setUserData] = useState<SockbaseAccount>()

  const onInitialize: () => void =
    () => {
      if (!props.userData) return
      setUserData(props.userData)
    }
  useEffect(onInitialize, [props.userData])

  return (
    <>
      <PageTitle
        icon={<MdSettings />}
        title="マイページ設定"
        description="Sockbaseが共通で使用している設定はこのページで変更できます" />

      <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput value={userData?.email} />
            </FormItem>
            <FormItem>
              <FormLabel>氏名</FormLabel>
              <FormInput value={userData?.name} />
            </FormItem>
            <FormItem>
              <FormLabel>誕生日</FormLabel>
              <FormInput value={userData?.email} />
            </FormItem>
            <FormItem>
              <FormLabel>郵便番号</FormLabel>
              <FormInput value={userData?.postalCode} />
            </FormItem>
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormInput value={userData?.address} />
            </FormItem>
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormInput value={userData?.telephone} />
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormButton onClick={() => props.updateUserData()}>保存</FormButton>
            </FormItem>
          </FormSection>
        </>

        <>
          <h2>お問い合わせ</h2>

          <h3>パスワード</h3>
          <p>
            パスワードの再設定は現在準備中です。<br />
            再設定を希望される方は「お問い合わせ」よりご連絡ください。
          </p>

          <h3>アカウント削除</h3>
          <p>
            アカウント削除は現在準備中です。<br />
            削除を希望される方は「お問い合わせ」よりご連絡ください。
          </p>
        </>
      </TwoColumnsLayout>
    </>
  )
}

export default DashboardSettings
