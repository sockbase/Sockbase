import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdSettings } from 'react-icons/md'
import type { SockbaseAccount } from 'sockbase'
import useUserData from '../../hooks/useUserData'
import useFirebase from '../../hooks/useFirebase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import Settings from './Settings'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Loading from '../../components/Parts/Loading'

const DashboardSettingsPage: React.FC = () => {
  const { user } = useFirebase()
  const { getMyUserDataAsync, updateUserDataAsync } = useUserData()

  const [userData, setUserData] = useState<SockbaseAccount>()

  const updateUserData: (_userData: SockbaseAccount) => Promise<void> =
    useCallback(async (_userData) => {
      if (!user) return
      setUserData(_userData)
      await updateUserDataAsync(user.uid, _userData)
        .catch(err => { throw err })
    }, [user])

  const onInitialize: () => void =
    () => {
      const fetchUserDataAsync: () => Promise<void> =
        async () => {
          const fetchedUserData = await getMyUserDataAsync()
          if (!fetchedUserData) return
          setUserData(fetchedUserData)
        }
      fetchUserDataAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [getMyUserDataAsync])

  return (
    <DashboardBaseLayout title="マイページ設定">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdSettings />}
        title="マイページ設定"
        description="Sockbaseが共通で使用している設定はこのページで変更できます" />

      {userData
        ? <Settings
          userData={userData}
          updateUserDataAsync={updateUserData}
        />
        : <Loading text="ユーザ情報" />}
    </DashboardBaseLayout>
  )
}

export default DashboardSettingsPage
