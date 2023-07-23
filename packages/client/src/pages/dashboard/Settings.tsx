import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseAccount } from 'sockbase'
import useUserData from '../../hooks/useUserData'
import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import DashboardSettings from '../../components/pages/dashboard/Settings'
import useFirebase from '../../hooks/useFirebase'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'
import { MdSettings } from 'react-icons/md'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'

const SettingsContainer: React.FC = () => {
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
    <DashboardLayout title="マイページ設定">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdSettings />}
        title="マイページ設定"
        description="Sockbaseが共通で使用している設定はこのページで変更できます" />

      {userData && <DashboardSettings
        userData={userData}
        updateUserDataAsync={updateUserData}
      />}
    </DashboardLayout>
  )
}

export default SettingsContainer
