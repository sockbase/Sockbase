import { useEffect, useMemo, useState } from 'react'
import { MdReceiptLong } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import LogotypeSVG from '../../../assets/logotype.svg'
import Alert from '../../../components/Parts/Alert'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useApplication from '../../../hooks/useApplication'
import useConfig from '../../../hooks/useConfig'
import useDayjs from '../../../hooks/useDayjs'
import useEvent from '../../../hooks/useEvent'
import usePayment from '../../../hooks/usePayment'
import useStore from '../../../hooks/useStore'
import useUserData from '../../../hooks/useUserData'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import DashboardPrintLayout from '../../../layouts/DashboardPrintLayout/DashboardPrintLayout'
import type {
  SockbaseEventDocument,
  SockbaseReceiptConfig,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseAccount,
  SockbasePaymentDocument,
  SockbasePaymentHashDocument
} from 'sockbase'

const DashboardReceiptViewPage: React.FC = () => {
  const { hashId } = useParams<{ hashId: string }>()
  const { getMyUserDataAsync } = useUserData()
  const { getPaymentHashAsync, getPaymentAsync } = usePayment()
  const { getApplicationByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getTicketByIdAsync, getStoreByIdAsync } = useStore()
  const { formatByDate } = useDayjs()
  const {
    getReceiptConfigForNectaritionAsync,
    getReceiptConfigForNPJPNetAsync
  } = useConfig()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [paymentHash, setPaymentHash] = useState<SockbasePaymentHashDocument>()
  const [payment, setPayment] = useState<SockbasePaymentDocument>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [config, setConfig] = useState<SockbaseReceiptConfig>()

  const [targetName, setTargetName] = useState<string>()
  const [orgId, setOrgId] = useState<string>()

  const targetType = useMemo(() => {
    if (!payment) return
    return payment.applicationId ? 'イベント参加費' : 'チケット購入費'
  }, [payment])

  useEffect(() => {
    getMyUserDataAsync()
      .then(setUserData)
      .catch(err => { throw err })
  }, [getMyUserDataAsync])

  useEffect(() => {
    if (!hashId) return
    getPaymentHashAsync(hashId)
      .then(setPaymentHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!paymentHash) return
    getPaymentAsync(paymentHash.paymentId)
      .then(setPayment)
      .catch(err => { throw err })
  }, [paymentHash])

  useEffect(() => {
    if (!payment) return
    if (payment.applicationId) {
      getApplicationByIdAsync(payment.applicationId)
        .then(app => {
          getEventByIdAsync(app.eventId)
            .then(setEvent)
            .catch(err => { throw err })
        })
    }
    else if (payment.ticketId) {
      getTicketByIdAsync(payment.ticketId)
        .then(ticket => {
          setTicket(ticket)
          getStoreByIdAsync(ticket.storeId)
            .then(setStore)
            .catch(err => { throw err })
        })
    }
  }, [payment])

  useEffect(() => {
    if (!event && !store && !ticket) return
    if (event) {
      setTargetName(event.name)
      setOrgId(event._organization.id)
    }
    else if (store && ticket) {
      const type = store.types.find(type => type.id === ticket.typeId)
      setTargetName(`${store.name} - ${type!.name}`)
      setOrgId(store._organization.id)
    }
  }, [event, store, ticket])

  useEffect(() => {
    if (!orgId) return
    if (orgId === 'npjpnet') {
      getReceiptConfigForNPJPNetAsync()
        .then(setConfig)
        .catch(err => { throw err })
      return
    }
    getReceiptConfigForNectaritionAsync()
      .then(setConfig)
      .catch(err => { throw err })
  }, [orgId])

  const taxDetails = useMemo(() => {
    if (!payment?.paymentAmount) return
    const amount = payment.paymentAmount
    const taxExcluded = Math.floor(amount / (1 + 0.1))
    const taxAmount = amount - taxExcluded
    return { taxExcluded, taxAmount }
  }, [payment?.paymentAmount])

  const Receipt = useMemo(() => {
    if (payment?.status !== 1 || payment?.paymentMethod !== 1) return

    return (
      <PrintOnlyArea>
        <Scrollable>
          <A4Page>
            <Grid>
              <HeaderCell>
                <HeaderTitleArea>
                  <HeaderTitle>領収書</HeaderTitle>
                  <HeaderSubTitle>Receipt</HeaderSubTitle>
                </HeaderTitleArea>
                <HeaderLogoArea>
                  <LogotypeImage src={LogotypeSVG} />
                </HeaderLogoArea>
              </HeaderCell>
              <NameCell>
                <Name>{userData?.name} <small>様</small></Name>
              </NameCell>
              <MetaCell>
                <ItemTable>
                  <tbody>
                    <tr>
                      <th>No.</th>
                      <td>{hashId}</td>
                    </tr>
                    <tr>
                      <th>領収日</th>
                      <td>{formatByDate(payment?.purchasedAt, 'YYYY年 M月 D日')}</td>
                    </tr>
                  </tbody>
                </ItemTable>
              </MetaCell>
              <TotalAmountCell>
                <TotalAmount>￥{payment?.paymentAmount.toLocaleString()}-</TotalAmount>
              </TotalAmountCell>
              <TaxCell>
                <ItemTable style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <th>10% 対象</th>
                      <td style={{ textAlign: 'right' }}>￥{taxDetails?.taxExcluded.toLocaleString()}-</td>
                    </tr>
                    <tr>
                      <th>消費税額</th>
                      <td style={{ textAlign: 'right' }}>￥{taxDetails?.taxAmount.toLocaleString()}-</td>
                    </tr>
                  </tbody>
                </ItemTable>
              </TaxCell>
              <DescriptionCell>
                <Description>
                  但し {targetType} として<br />
                  上記正に領収しました。
                </Description>
              </DescriptionCell>
              <FooterCell>
                <ItemTable>
                  <tbody>
                    {config?.name && (
                      <tr>
                        <th>{config.name}</th>
                      </tr>
                    )}
                    {config?.registrationNumber && (
                      <tr>
                        <td><small>登録番号 {config.registrationNumber}</small></td>
                      </tr>
                    )}
                    {config?.websiteURL && (
                      <tr>
                        <td>Web/ {config.websiteURL}</td>
                      </tr>
                    )}
                    {config?.email && (
                      <tr>
                        <td>Mail/ {config.email}</td>
                      </tr>
                    )}
                  </tbody>
                </ItemTable>
              </FooterCell>
            </Grid>
            <Hr />
          </A4Page>
        </Scrollable>
      </PrintOnlyArea>
    )
  }, [userData, hashId, payment?.updatedAt, payment?.paymentAmount, taxDetails, targetType, config])

  return (
    <DashboardPrintLayout title="領収書">
      <NoPrintArea>
        <Breadcrumbs>
          <li><Link to="/dashboard">マイページ</Link></li>
          <li><Link to="/dashboard/payments">決済履歴</Link></li>
          <li><Link to={`/dashboard/payments/${hashId}`}>決済詳細情報</Link></li>
        </Breadcrumbs>
        <PageTitle
          description="領収書"
          icon={<MdReceiptLong />}
          isLoading={!targetName}
          title={targetName} />
        {payment && payment.status !== 1 && (
          <Alert
            title="お支払いが未完了です"
            type="warning">
            お支払いが完了していないため、領収書を発行できません。
          </Alert>
        )}
        {payment && payment.paymentMethod !== 1 && (
          <Alert
            title="銀行振込のため領収書を発行できません。"
            type="warning">
            銀行振込でお支払いいただいた場合、領収書を発行することができません。<br />
            振り込み明細をご利用ください。
          </Alert>
        )}
      </NoPrintArea>
      {Receipt}
    </DashboardPrintLayout>
  )
}

export default DashboardReceiptViewPage

const NoPrintArea = styled.div`
  padding: 20px;
  padding-bottom: 0;
  @media print {
    display: none;
  }
`
const PrintOnlyArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
const Scrollable = styled.div`
  padding: 20px;
  height: 100%;
  overflow: auto;
  @media print {
    padding: 0;
  }
`

const A4Page = styled.div`
  width: 210mm;
  height: 297mm;
  padding: 15mm;
  background-color: white;
  color: #000000;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.5em;
  font-family: 'Noto Sans JP', sans-serif;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 40%;
  grid-template-rows: auto auto auto auto;
  gap: 10px 20px;
`
const HeaderCell = styled.div`
  grid-row: 1 / 2;
  grid-column: 1 / 3;
  background-color: #000000;
  color: #ffffff;
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 10px;
`
const HeaderTitleArea = styled.div``
const HeaderTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.25em;
`
const HeaderSubTitle = styled.div``
const HeaderLogoArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`
const LogotypeImage = styled.img`
  width: 128px;
`
const NameCell = styled.div`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const Name = styled.div`
  font-size: 24px;
  border-bottom: 1px solid #000000;
`
const MetaCell = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
`
const TotalAmountCell = styled.div`
  grid-column: 1 / 2;
  grid-row: 3 / 4;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const TotalAmount = styled.div`
  font-size: 24px;
  border-bottom: 1px solid #000000;
`
const TaxCell = styled.div`
  grid-column: 2 / 3;
  grid-row: 3 / 4;
`
const DescriptionCell = styled.div`
  grid-column: 1 / 3;
  grid-row: 4 / 5;
`
const Description = styled.div`
`
const FooterCell = styled.div`
  grid-column: 2 / 3;
  grid-row: 5 / 6;
`
const Hr = styled.hr`
  border: none;
  border-bottom: 1px solid #000000;
`
const ItemTable = styled.table`
  width: auto;
  background-color: #ffffff;
  tbody {
    border: none;
  }
  tr {
    border: none;
  }
  th, td {
    padding: 0 5px;
  }
`
