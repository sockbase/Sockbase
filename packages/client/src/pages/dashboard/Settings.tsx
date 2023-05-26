import { useCallback, useEffect, useState } from 'react'
import type { SockbaseAccount } from 'sockbase'

import useUserData from '../../hooks/useUserData'

import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import DashboardSettings from '../../components/pages/dashboard/Settings'
import useFirebase from '../../hooks/useFirebase'

const DashboardContainer: React.FC = () => {
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
      {userData && <DashboardSettings
        userData={userData}
        updateUserDataAsync={updateUserData}
      />}
    </DashboardLayout>
  )
}

export default DashboardContainer
