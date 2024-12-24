import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import ReactQRCode from 'react-qr-code'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import logotypeSVG from '../../assets/logotype.svg'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useDayjs from '../../hooks/useDayjs'
import useStore from '../../hooks/useStore'

interface Props {
  ticketHashId: string
  ticketUser: SockbaseTicketUserDocument
  store: SockbaseStoreDocument
  userId: string
}
const TicketView: React.FC<Props> = props => {
  const { assignTicketUserAsync } = useStore()
  const { formatByDate } = useDayjs()

  const [isProgress, setProgress] = useState(false)
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [updatedDate, setUpdatedDate] = useState<Date>()

  const type = useMemo(() => {
    if (!props.ticketUser || !props.store) return

    return props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
  }, [props.ticketUser, props.store])

  const showQRCode = useMemo(() => {
    if (ticketUser?.isStandalone) {
      return false
    }
    else if (ticketUser?.usableUserId === null) {
      return false
    }
    else if (ticketUser?.usableUserId !== props.userId) {
      return false
    }

    return true
  }, [ticketUser, props.userId])

  const handleAssignMe = useCallback(() => {
    if (!ticketUser || ticketUser.isStandalone || ticketUser.userId !== props.userId) return
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
  }, [props.ticketHashId, props.userId, ticketUser])

  useEffect(() => {
    setTicketUser(props.ticketUser)
    const cancelToken = setInterval(() => {
      setUpdatedDate(new Date())
    }, 1000)

    return () => {
      clearInterval(cancelToken)
    }
  }, [props.ticketUser])

  return (
    <Container>
      <TicketContainer>
        <TicketStatusContainer>
          {props.ticketUser.used && !ticketUser?.isStandalone && (
            <UsedTicketAlert>このチケットは使用済みです</UsedTicketAlert>
          )}
        </TicketStatusContainer>
        <TitleWrapper
          color={type?.color || 'var(--background-disabled-color)'}
          disabled={!ticketUser?.usableUserId || ticketUser?.used}>
          <TitleContainer>
            <StoreName>{props.store.name}</StoreName>
            <TypeName>{type?.name}</TypeName>
            <QRCodeArea>
              {showQRCode
                ? (
                  <QRCode
                    size={192}
                    value={props.ticketHashId} />
                )
                : (
                  <DummyQRCode>
                    <DummyQRCodeTextArea>
                      ご利用<br />
                      いただけません
                    </DummyQRCodeTextArea>
                  </DummyQRCode>
                )}
            </QRCodeArea>
            <Code>{props.ticketHashId}</Code>
          </TitleContainer>
        </TitleWrapper>
        <ContentContainer>
          {ticketUser?.isStandalone && (
            <Alert
              title="このチケットは使用できません (スタンドアロン)"
              type="error" />
          )}
          {ticketUser?.usableUserId === null && !ticketUser?.isStandalone && (
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
            </Alert>
          )}
          {ticketUser?.usableUserId && !ticketUser?.isStandalone && props.userId !== ticketUser?.usableUserId && (
            <Alert
              title="他の方に割り当てられているチケットです"
              type="warning">
                  あなたが使用すると、割り当てた方が使用できなくなります。<br />
                  自分のチケットは <Link to="/dashboard/mytickets">マイチケット</Link> から確認できます。
            </Alert>
          )}
          {ticketUser?.used && !ticketUser?.isStandalone && (
            <Alert
              title="使用済みです"
              type="error">
                このチケットは既に使用されています。
            </Alert>
          )}
          {ticketUser?.usableUserId === props.userId && (
            <>
              <p>
                上の QR コードを入口スタッフまでご提示ください。<br />
                QR コードを提示できない場合は、この画面を印刷しご持参ください。
              </p>
            </>
          )}
          {!ticketUser && (
            <Loading text="チケット情報" />
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
  color: var(--white-color);
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
const DummyQRCode = styled.div`
  display: inline-block;
  padding: 20px;
  width: 192px;
  height: 192px;
  background-color: #ffffff;
`
const DummyQRCodeTextArea = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--black-color);
  font-weight: bold;
  font-size: 1.25em;
  line-height: 1.25em;
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
