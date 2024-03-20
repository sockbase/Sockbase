import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdPrint } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { type SockbaseApplicationDocument, type SockbaseEventDocument, type SockbaseApplicationMeta, type SockbaseAccount } from 'sockbase'
import FormCheckbox from '../../components/Form/Checkbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import DashboardPrintLayout from '../../components/Layout/DashboardPrintLayout/DashboardPrintLayout'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useUserData from '../../hooks/useUserData'
import Tanzaku from './Tanzaku'

const DashboardEventCircleApplicationPrintTanzaku: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getCircleCutURLByHashedIdAsync,
    getApplicationMetaByIdAsync
  } = useApplication()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()
  const [appMetas, setAppMetas] = useState<Record<string, SockbaseApplicationMeta>>()
  const [circleCuts, setCircleCuts] = useState<Record<string, string | null>>()
  const [userDatas, setUserDatas] = useState<Record<string, SockbaseAccount>>()

  const [dummyCount, setDummyCount] = useState('0')
  const [isDummyOnly, setDummyOnly] = useState(false)

  const dummyApps = useMemo(() => {
    if (!event) return []

    const results = []
    for (let i = 0; i < Number(dummyCount); i++) {
      results.push(<Tanzaku isDummy={true} dummyNumber={i + 1} event={event} />)
    }
    return results
  }, [dummyCount])

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

      Promise.all(
        fetchedApps.map(a => a.hashId)
          .filter(id => id)
          .map(id => id ?? '')
          .map(async id => ({
            id,
            data: await getCircleCutURLByHashedIdAsync(id)
          }))
      )
        .then(fetchedCircleCuts => fetchedCircleCuts.reduce<Record<string, string>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
        .then(fetchedCircleCuts => setCircleCuts(fetchedCircleCuts))
        .catch(err => { throw err })

      Promise.all(
        fetchedApps.map(a => a.id)
          .map(async id => ({
            id,
            data: await getApplicationMetaByIdAsync(id)
          }))
      )
        .then(fetchedAppMetas => fetchedAppMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
        .then(fetchedAppMetas => setAppMetas(fetchedAppMetas))
        .catch(err => { throw err })

      Promise.all(
        fetchedApps.map(a => a.userId)
          .map(async id => ({
            id,
            data: await getUserDataByUserIdAndEventIdAsync(id, eventId)
          }))
      )
        .then(fetchedUserDatas => fetchedUserDatas.reduce<Record<string, SockbaseAccount>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
        .then(fetchedUserDatas => setUserDatas(fetchedUserDatas))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  const getUnionCircle = useCallback((app: SockbaseApplicationDocument): SockbaseApplicationDocument | null => {
    if (!apps) return null
    return apps.filter(a => a.hashId === app.unionCircleId)[0]
  }, [apps])

  return (
    <DashboardPrintLayout title="配置短冊印刷" requireCommonRole={2}>
      <ControlContainer>
        <Breadcrumbs>
          <li><Link to="/dashboard">マイページ</Link></li>
          <li><Link to="/dashboard/events">管理イベント</Link></li>
          <li>{event?._organization.name ?? <BlinkField />}</li>
          <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
        </Breadcrumbs>

        <PageTitle
          title={event?.eventName}
          description="配置短冊印刷"
          icon={<MdPrint />}
          isLoading={!event} />
        <FormSection>
          <FormItem>
            <FormLabel>準備会スペースのみ印刷</FormLabel>
            <FormCheckbox
              name="dummy-only"
              label="準備会スペースのみ印刷"
              checked={isDummyOnly}
              onChange={checked => setDummyOnly(checked)} />
          </FormItem>
          <FormItem>
            <FormLabel>事故スペース数</FormLabel>
            <FormInput value={dummyCount} onChange={e => setDummyCount(e.target.value)} />
          </FormItem>
        </FormSection>
      </ControlContainer>
      <TanzakuContainer>
        {isDummyOnly && apps && event && circleCuts && appMetas && userDatas && apps
          .filter(a => appMetas[a.id].applicationStatus === 2)
          .map(a => a.hashId && <Tanzaku
            key={a.id}
            isDummy={false}
            event={event}
            app={a}
            userData={userDatas[a.userId]}
            unionCircle={getUnionCircle(a)}
            circleCutData={circleCuts[a.hashId]} />)}
        {dummyApps}
      </TanzakuContainer>
    </DashboardPrintLayout>
  )
}

export default DashboardEventCircleApplicationPrintTanzaku

const ControlContainer = styled.div`
  padding: 20px;
  background-color: var(--background-color);
  margin-bottom: 20px;
  @media print {
    display: none;
  }
`
const TanzakuContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`
