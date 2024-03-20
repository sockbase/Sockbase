import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import DashboardPrintLayout from '../../components/Layout/DashboardPrintLayout/DashboardPrintLayout'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import Tanzaku from './Tanzaku'
import type { SockbaseEventSpace, SockbaseApplicationDocument, SockbaseEventDocument } from 'sockbase'

const DashboardEventCircleApplicationPrintTanzaku: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()
  const { getApplicationsByEventIdAsync, getCircleCutURLByHashedIdAsync } = useApplication()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()
  const [circleCuts, setCircleCuts] = useState<Record<string, string | null>>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      const fetchedApps = Object.values(
        await getApplicationsByEventIdAsync(eventId)
          .catch(err => { throw err }))
      setApps(fetchedApps)

      const fetchedCircleCuts = await Promise.all(
        fetchedApps.map(a => a.hashId)
          .filter(id => id)
          .map(id => id ?? '')
          .map(async id => ({
            id,
            data: await getCircleCutURLByHashedIdAsync(id)
          }))
      )
        .then(fetchedCircleCuts => fetchedCircleCuts.reduce<Record<string, string>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
      setCircleCuts(fetchedCircleCuts)
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  const getSpace = useCallback((app: SockbaseApplicationDocument): SockbaseEventSpace | null => {
    if (!event) return null
    return event.spaces.filter(s => s.id === app.spaceId)[0]
  }, [event])

  const getUnionCircle = useCallback((app: SockbaseApplicationDocument): SockbaseApplicationDocument | null => {
    if (!apps) return null
    return apps.filter(a => a.hashId === app.unionCircleId)[0]
  }, [apps])

  return (
    <DashboardPrintLayout title="配置短冊印刷" requireCommonRole={2}>
      <TanzakuContainer>
        {circleCuts && apps?.map(a => a.hashId && <Tanzaku
          key={a.id}
          app={a}
          unionCircle={getUnionCircle(a)}
          space={getSpace(a)}
          circleCutData={circleCuts[a.hashId]} />)}
      </TanzakuContainer>
    </DashboardPrintLayout>
  )
}

export default DashboardEventCircleApplicationPrintTanzaku

const TanzakuContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`
