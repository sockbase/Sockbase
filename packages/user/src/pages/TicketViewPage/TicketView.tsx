import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import ReactQRCode from 'react-qr-code'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import logotypeSVG from '../../assets/logotype.svg'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useDayjs from '../../hooks/useDayjs'
import useStore from '../../hooks/useStore'

interface Props {
  ticketHashId: string
  ticketUser: SockbaseTicketUserDocument
  store: SockbaseStoreDocument
  userId: string | null
}
const TicketView: React.FC<Props> = props => {
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

  const type = useMemo(() => {
    if (!props.ticketUser || !props.store) return

    return props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
  }, [props.ticketUser, props.store])

  const handleAssignMe = (): void => {
    if (!ticketUser || ticketUser.userId !== props.userId) return
    setProgress(true)
    assignTicketUserAsync(props.userId, props.ticketHashId)
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
        <TicketStatusContainer>
          {props.ticketUser.used && <UsedTicketAlert>このチケットは使用済みです</UsedTicketAlert>}
        </TicketStatusContainer>
        <TitleWrapper
          color={type?.color || 'var(--background-disabled-color)'}
          disabled={!ticketUser?.usableUserId || ticketUser?.used}>
          <TitleContainer>
            <StoreName>{props.store.name}</StoreName>
            <TypeName>{type?.name}</TypeName>
            <QRCodeArea>
              <QRCode
                size={192}
                value={props.ticketHashId} />
            </QRCodeArea>
            <Code>{props.ticketHashId}</Code>
          </TitleContainer>
        </TitleWrapper>
        <ContentContainer>
          {ticketUser && ticketUser.usableUserId === null
            ? (
              <>
                <Alert
                  title="チケットの割り当てが完了していません"
                  type="error">
                このチケットを使うユーザの割り当てが完了していません。
                  {props.userId !== ticketUser.userId && (
                    <>
                      <br />
                    チケット購入者からチケット受け取り URL を送付してもらい、情報を入力してください。
                    </>
                  )}
                </Alert>
                {props.userId === ticketUser.userId && (
                  <>
                    <p>
                    自分でこのチケットを使う場合は「チケットを有効化する」を押してください。<br />
                    他の方にチケットを渡す場合は、<Link to={`/dashboard/tickets/${props.ticketHashId}`}>チケット情報表示ページ</Link> から チケット受け取り URL を渡してください。
                    </p>
                    <FormSection>
                      <FormItem>
                        <LoadingCircleWrapper isLoading={isProgress}>
                          <FormButton
                            disabled={isProgress}
                            onClick={handleAssignMe}>チケットを有効化する
                          </FormButton>
                        </LoadingCircleWrapper>
                      </FormItem>
                    </FormSection>
                  </>
                )}
              </>
            )
            : (
              <>
                {props.ticketUser.used
                  ? (
                    <Alert
                      title="使用済みです"
                      type="error">
                  このチケットは既に使用されています。
                    </Alert>
                  )
                  : ticketUser && props.userId !== ticketUser.usableUserId && (
                    <Alert
                      title="他の方に割り当てられているチケットです"
                      type="warning">
                  あなたが使用すると、割り当てた方が使用できなくなります。<br />
                  自分のチケットは <Link to="/dashboard/mytickets">マイチケット</Link> から確認できます。
                    </Alert>
                  )}
                <p>
                上の QR コードを入口スタッフまでご提示ください。
                </p>
                <p>
                QR コードを提示できない場合は、この画面を印刷しご持参ください。
                </p>
              </>
            )}
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
    </Container >
  )
}

export default TicketView

const Container = styled.div`
  height: 100%;
  padding: 40px 25%;

  background-color: var(--panel-background-color);

  @media screen and (max-width: 840px) {
    padding: 0;
  }
`
const TicketContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto auto auto;
  max-width: 840px;
  
  @media screen and (max-width: 840px) {
    height: 100%;
    grid-template-rows: auto auto 1fr auto;
  }
`
const TitleWrapper = styled.section<{ disabled?: boolean, color: string }>`
  background-color: ${props => props.disabled
    ? 'var(--pending-color)'
    : props.color || 'var(--background-disabled-color)'};
`
const TicketStatusContainer = styled.div`
`
const UsedTicketAlert = styled.div`
  background-color: var(--danger-color);
  padding: 10px;
  text-align: center;
`
const loopBackgroundKeyframes = keyframes`
  0% {
    background-position: 256px 0;
  }
  100% {
    background-position: 0 256px;
  }
`
const TitleContainer = styled.section`
  padding: 20px;
  color: var(--white-color);
  text-align: center;
  border-radius: 5px 5px 0 0;
  @media screen and (max-width: 840px) {
    border-radius: 0;
  }
  
  background-image: url('/assets/bg-pattern2.png');
  background-position: 0 0;
  background-repeat: repeat;
  animation: ${loopBackgroundKeyframes} 5s linear infinite;
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
const Code = styled.div`
  margin-top: 20px;
  font-size: 0.8em;
`
const ContentContainer = styled.section`
  padding: 20px;
  background-color: var(--body-background-color);
`
const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 10px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background-color: var(--brand-background-color);
  text-align: right;
`

const UpdatedDate = styled.section`
  margin-top: -2px;
  color: var(--white-color);
`
const LogotypeArea = styled.section``

const Logotype = styled.img`
  height: 16px;
`
