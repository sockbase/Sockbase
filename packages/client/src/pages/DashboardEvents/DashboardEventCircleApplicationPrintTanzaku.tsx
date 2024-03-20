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
import Atamagami from './Atamagami'
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

  const [printAtamagami, setPrintAtamagami] = useState(true)
  const [printCircleTanzaku, setPrintCircleTanzaku] = useState(true)
  const [printDummyTanzaku, setPrintDummyTanzaku] = useState(false)
  const [dummyCount, setDummyCount] = useState('0')
  const [dummyBaseCount, setDummyBaseCount] = useState('0')

  const dummyApps = useMemo(() => {
    if (!event) return []

    const results = []
    for (let i = 0; i < Number(dummyCount); i++) {
      results.push(<Tanzaku isDummy={true} dummyNumber={i + 1 + Number(dummyBaseCount)} event={event} />)
    }
    return results
  }, [dummyCount, dummyBaseCount])

  const activeCircles = useMemo(() => {
    if (!apps || !appMetas) return []
    return apps.filter(a => appMetas[a.id].applicationStatus === 2)
  }, [apps, appMetas])

  const circleCount = useMemo(() => activeCircles.length, [activeCircles])

  const spaceCount = useMemo(() => {
    if (!apps || !event) return 0
    const dualSpaceIds = event.spaces
      .filter(s => s.isDualSpace)
      .map(s => s.id)
    return activeCircles.length + activeCircles
      .filter(a => dualSpaceIds.includes(a.spaceId)).length
  }, [activeCircles])

  const adultCount = useMemo(() => activeCircles.filter(a => a.circle.hasAdult).length, [activeCircles])
  const unionCircleCount = useMemo(() => activeCircles.filter(a => a.unionCircleId).length, [activeCircles])
  const petitCount = useMemo(() => activeCircles.filter(a => a.petitCode).length, [activeCircles])

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
            <FormLabel>印刷する短冊</FormLabel>
            <FormCheckbox
              name="atamagami"
              label="頭紙"
              checked={printAtamagami}
              onChange={checked => setPrintAtamagami(checked)} />
            <FormCheckbox
              name="circle"
              label="配置短冊"
              checked={printCircleTanzaku}
              onChange={checked => setPrintCircleTanzaku(checked)} />
            <FormCheckbox
              name="dummy"
              label="準備会スペース"
              checked={printDummyTanzaku}
              onChange={checked => setPrintDummyTanzaku(checked)} />
          </FormItem>
        </FormSection>
        {printDummyTanzaku && <FormSection>
          <FormItem>
            <FormLabel>準備会スペース 印刷枚数</FormLabel>
            <FormInput value={dummyCount} onChange={e => setDummyCount(e.target.value)} />
          </FormItem>
          <FormItem>
            <FormLabel>準備会スペース短冊 スペース数開始値</FormLabel>
            <FormInput value={dummyBaseCount} onChange={e => setDummyBaseCount(e.target.value)} />
          </FormItem>
        </FormSection>}
      </ControlContainer>

      <TanzakuContainer>
        {printAtamagami && event && <Atamagami
          event={event}
          circleCount={circleCount}
          spaceCount={spaceCount}
          adultCount={adultCount}
          unionCircleCount={unionCircleCount}
          petitCount={petitCount} />}
        {printCircleTanzaku && apps && event && circleCuts && appMetas && userDatas && apps
          .filter(a => appMetas[a.id].applicationStatus === 2)
          .map(a => a.hashId && <Tanzaku
            key={a.id}
            isDummy={false}
            event={event}
            app={a}
            userData={userDatas[a.userId]}
            unionCircle={getUnionCircle(a)}
            circleCutData={circleCuts[a.hashId]} />)}
        {printDummyTanzaku && dummyApps}
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
