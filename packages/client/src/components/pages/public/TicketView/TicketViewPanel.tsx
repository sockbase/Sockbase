import { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import ReactQRCode from 'react-qr-code'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'

import logotypeSVG from '../../../../assets/logotype.svg'
import Alert from '../../../Parts/Alert'
import { Link } from 'react-router-dom'
import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'
import FormButton from '../../../Form/Button'
import LoadingCircleWrapper from '../../../Parts/LoadingCircleWrapper'
import useStore from '../../../../hooks/useStore'
import useDayjs from '../../../../hooks/useDayjs'

interface Props {
  ticketHashId: string
  ticketUser: SockbaseTicketUserDocument
  store: SockbaseStoreDocument
  userId: string | null
}
const TicketViewPanel: React.FC<Props> = (props) => {
  const { assignTicketUserAsync } = useStore()
  const { formatByDate } = useDayjs()

  const [isProgress, setProgress] = useState(false)
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [updatedDate, setUpdatedDate] = useState<Date>()

  const onInitialize = (): () => void => {
    setTicketUser(props.ticketUser)
    const cancelToken = setInterval(() => {
      setUpdatedDate(new Date())
    }, 1000)

    return () => {
      clearInterval(cancelToken)
    }
  }
  useEffect(onInitialize, [props.ticketUser])

  const typeName = useMemo(() => {
    if (!props.ticketUser || !props.store) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.ticketUser, props.store])

  const handleAssignMe = (): void => {
    if (!ticketUser || ticketUser.userId !== props.userId) return
    setProgress(true)
    assignTicketUserAsync(props.ticketHashId)
      .then(() => {
        setTicketUser(s => (s && { ...s, usableUserId: props.userId }))
      })
      .catch(err => {
        alert('エラーが発生しました')
        throw err
      })
      .finally(() => setProgress(false))
  }

  return (
    <Container>
      <TicketContainer>
        <TitleContainer disabled={ticketUser?.usableUserId !== null}>
          <StoreName>{props.store.storeName}</StoreName>
          <TypeName>{typeName}</TypeName>
          <QRCodeArea>
            <QRCode value={props.ticketHashId} size={192} />
          </QRCodeArea>
        </TitleContainer>
        <ContentContainer>
          {ticketUser && ticketUser.usableUserId === null
            ? <>
              <Alert title="チケットの割り当てが完了していません" type="danger">
                このチケットを使うユーザの割り当てが完了していません。
                {props.userId !== ticketUser.userId
                  && <>
                    <br />
                    チケット購入者からチケット受け取りURLを送付してもらい、情報を入力してください。
                  </>}
              </Alert>
              {props.userId === ticketUser.userId
                && <>
                  <p>
                    自分でこのチケットを使う場合は「チケットを有効化する」を押してください。<br />
                    他の方にチケットを渡す場合は、<Link to={`/dashboard/tickets/${props.ticketHashId}`}>チケット情報表示ページ</Link> から チケット受け取りURL を渡してください。
                  </p>
                  <FormSection>
                    <FormItem>
                      <LoadingCircleWrapper isLoading={isProgress}>
                        <FormButton onClick={handleAssignMe} disabled={isProgress}>チケットを有効化する</FormButton>
                      </LoadingCircleWrapper>
                    </FormItem>
                  </FormSection>
                </>}
            </>
            : <>
              <p>
                上のQRコードを入口スタッフまでご提示ください。
              </p>
              <p>
                QRコードを提示できない場合は、この画面を印刷しご持参ください。
              </p>
            </>}
        </ContentContainer>
        <Footer>
          <UpdatedDate>
            <b>{formatByDate(updatedDate, 'YYYY-MM-DD HH:mm:ss')}</b>
          </UpdatedDate>
          <LogotypeArea>
            <Logotype src={logotypeSVG} />
          </LogotypeArea>
        </Footer>
      </TicketContainer>
    </Container>
  )
}

export default TicketViewPanel

const Container = styled.div`
  height: 100%;
  padding: 40px 25%;

  @media screen and (max-width: 840px) {
    padding: 0;
  }
`
const TicketContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto auto;
  max-width: 840px;
  
  @media screen and (max-width: 840px) {
    height: 100%;
    grid-template-rows: auto 1fr auto;
  }
`
const TitleContainer = styled.section<{ disabled?: boolean, color?: string }>`
  padding: 20px;
  background-color: ${props => props.disabled
    ? '#c0c0c0'
    : props.color || '#202020'};
  color: #ffffff;
  text-align: center;
  border-radius: 5px 5px 0 0;
  @media screen and (max-width: 840px) {
    border-radius: 0;
  }
`
const StoreName = styled.div``
const TypeName = styled.div`
  font-size: 1.5em;
  font-weight: bold;
`
const QRCodeArea = styled.section`
  margin-top: 20px;
`
const QRCode = styled(ReactQRCode)`
  padding: 20px;
  background-color: #ffffff;
`
const ContentContainer = styled.section`
  padding: 20px;
  background-color:#ffffff;
`

const blinkKeyframe = keyframes`
  0% {
    background-color: #404040;
  }
  100% {
    background-color: var(--primary-color);
  }
`
const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 10px;
  padding: calc(10px + env(safe-area-inset-bottom));
  background-color: #404040;
  text-align: right;
  border-radius: 0 0 5px 5px;

  @media screen and (max-width: 840px) {
    border-radius: 0;
  }

  animation: ${blinkKeyframe} 0.5s ease-in-out alternate infinite;
`

const UpdatedDate = styled.section`
  margin-top: -2px;
  color: #ffffff;
`
const LogotypeArea = styled.section``

const Logotype = styled.img`
  height: 16px;
`
