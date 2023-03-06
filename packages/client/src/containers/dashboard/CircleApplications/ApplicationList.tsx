import { useEffect, useState } from 'react'
import type { SockbaseApplicationDocument } from 'sockbase'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationList from '../../../components/pages/dashboard/CircleApplications/ApplicationList'

import useFirebase from '../../../hooks/useFirebase'
import useApplication from '../../../hooks/useApplication'

const ApplicationListContainer: React.FC = () => {
  const { user } = useFirebase()
  const { getApplicationsByUserIdAsync } = useApplication()

  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()

  const onChangeLoggedInStatus: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!user) return
          const fetchedApps = await getApplicationsByUserIdAsync(user.uid)
          setApps(fetchedApps)
        }
      fetchAppsAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onChangeLoggedInStatus, [user])

  return (
    <DashboardLayout title="申し込んだイベント">
      {apps && <ApplicationList apps={apps} />}
    </DashboardLayout>
  )
}

export default ApplicationListContainer
