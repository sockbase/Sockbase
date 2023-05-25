import { useEffect, useState } from 'react'
import type { SockbaseAccount } from 'sockbase'

import useUserData from '../../hooks/useUserData'

import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import DashboardSettings from '../../components/pages/dashboard/Settings'

const DashboardContainer: React.FC = () => {
  const { getMyUserDataAsync } = useUserData()

  const [userData, setUserData] = useState<SockbaseAccount>()

  const updateUserData: () => void =
    () => {
      alert('hello world!')
    }

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
        updateUserData={updateUserData}
      />}
    </DashboardLayout>
  )
}

export default DashboardContainer
