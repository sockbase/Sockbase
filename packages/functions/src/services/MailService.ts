import mailConfig from '../configs/mail'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { getApplicaitonHashIdAsync, getApplicationByIdAsync, getApplicationMetaByAppIdAsync, getApplicationsByEventIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getTicketByIdAsync } from '../models/ticket'
import { getUserDataAsync } from '../models/user'
import type {
  SockbaseTicketDocument,
  SockbaseApplicationDocument,
  SockbasePaymentDocument,
  SockbaseInquiryDocument,
  SockbaseSendMailForEventPayload,
  SockbaseApplicationMeta,
  SockbaseAccountDocument,
  PaymentStatus
} from 'sockbase'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const sendMailAcceptCircleApplicationAsync = async (app: SockbaseApplicationDocument): Promise<void> => {
  const emailAddress = await getEmailAddress(app.userId)
  const event = await getEventByIdAsync(app.eventId)

  const template = mailConfig.templates.acceptApplication(event, app)
  await addQueueAsync(emailAddress, template)
}

const sendMailAcceptTicketAsync = async (ticket: SockbaseTicketDocument): Promise<void> => {
  if (ticket.createdUserId || !ticket.userId) return

  const emailAddress = await getEmailAddress(ticket.userId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  const template = mailConfig.templates.acceptTicket(store, type, ticket)
  await addQueueAsync(emailAddress, template)
}

const sendMailUpdateUnionCircleAsync = async (app: SockbaseApplicationDocument): Promise<void> => {
  if (!app.unionCircleId) return

  const unionAppHash = await getApplicaitonHashIdAsync(app.unionCircleId)
  const unionApp = await getApplicationByIdAsync(unionAppHash.applicationId)
  const event = await getEventByIdAsync(unionApp.eventId)
  const unionUserEmailAddress = await getEmailAddress(unionApp.userId)

  const template = mailConfig.templates.updateUnionCircle(event, app, unionApp)
  await addQueueAsync(unionUserEmailAddress, template)
}

const sendMailRequestPaymentAsync = async (payment: SockbasePaymentDocument): Promise<void> => {
  if (payment.paymentAmount === 0) return

  const emailAddress = await getEmailAddress(payment.userId)
  const template = payment.applicationId
    ? await requestCirclePaymentAsync(payment, payment.applicationId)
    : payment.ticketId
      ? await requestTicketPaymentAsync(payment, payment.ticketId)
      : null
  if (!template) return

  await addQueueAsync(emailAddress, template)
}

const requestCirclePaymentAsync = async (payment: SockbasePaymentDocument, appId: string): Promise<{ subject: string, body: string[] }> => {
  const app = await getApplicationByIdAsync(appId)
  const event = await getEventByIdAsync(app.eventId)
  const space = event.spaces.filter(s => s.id === app.spaceId)[0]

  return mailConfig.templates.requestCirclePayment(payment, app, event, space)
}

const requestTicketPaymentAsync = async (payment: SockbasePaymentDocument, ticketId: string): Promise<{ subject: string, body: string[] }> => {
  const ticket = await getTicketByIdAsync(ticketId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  return mailConfig.templates.requestTicketPayment(payment, ticket, store, type)
}

const sendMailAcceptPaymentAsync = async (beforeStatus: PaymentStatus, payment: SockbasePaymentDocument): Promise<void> => {
  if (beforeStatus === payment.status || payment.status !== 1 || payment.paymentAmount === 0) {
    return
  }

  const emailAddress = await getEmailAddress(payment.userId)
  const template = payment.applicationId
    ? await acceptCirclePaymentAsync(payment, payment.applicationId)
    : payment.ticketId
      ? await acceptTicketPaymentAsync(payment, payment.ticketId)
      : null
  if (!template) return

  await addQueueAsync(emailAddress, template)
}

const acceptCirclePaymentAsync = async (payment: SockbasePaymentDocument, appId: string): Promise<{ subject: string, body: string[] }> => {
  const app = await getApplicationByIdAsync(appId)
  const event = await getEventByIdAsync(app.eventId)
  const space = event.spaces.filter(s => s.id === app.spaceId)[0]

  return mailConfig.templates.acceptCirclePayment(payment, app, event, space)
}

const acceptTicketPaymentAsync = async (payment: SockbasePaymentDocument, ticketId: string): Promise<{ subject: string, body: string[] }> => {
  const ticket = await getTicketByIdAsync(ticketId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  return mailConfig.templates.acceptTicketPayment(payment, store, type, ticket)
}

const sendMailAcceptInquiryAsync = async (inquiry: SockbaseInquiryDocument): Promise<void> => {
  const emailAddress = await getEmailAddress(inquiry.userId)
  const userData = await getUserDataAsync(inquiry.userId)

  const template = mailConfig.templates.acceptInquiry(inquiry, userData)
  await addQueueAsync(emailAddress, template)
}

const getEmailAddress = async (userId: string): Promise<string> => {
  const user = await auth.getUser(userId)
  if (!user.email) {
    throw new Error('email no set')
  }
  return user.email
}

const addQueueAsync = async (emailAddress: string, content: { subject: string, body: string[] }): Promise<void> => {
  await firestore.collection('_mails')
    .add({
      to: emailAddress,
      message: {
        subject: content.subject,
        text: content.body.join('\n')
      }
    })
}

const sendMailManuallyForEventAsync = async (payload: SockbaseSendMailForEventPayload): Promise<boolean> => {
  const event = await getEventByIdAsync(payload.eventId)

  const apps = await getApplicationsByEventIdAsync(payload.eventId)
  if (apps.length === 0) {
    console.log('apps are empty')
    return false
  }

  const appMetas = await Promise.all(apps.map(async a => ({
    id: a.id,
    data: await getApplicationMetaByAppIdAsync(a.id)
  })))
    .then(fetchedMetas => {
      const mappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
        ...p,
        [c.id]: c.data
      }), {})
      return mappedMetas
    })
    .catch(err => { throw err })

  const targetApps = apps
    .filter(a => (payload.target.pending && appMetas[a.id].applicationStatus === 0)
    || (payload.target.canceled && appMetas[a.id].applicationStatus === 1)
    || (payload.target.confirmed && appMetas[a.id].applicationStatus === 2))
  if (targetApps.length === 0) {
    console.log('targetApps are empty')
    return false
  }

  const userIds = [...new Set(targetApps.map(a => a.userId))]
  const userDatas = await Promise.all(userIds.map(async userId => ({
    userId,
    data: await getUserDataAsync(userId)
  })))
    .then(fetchedUserDatas => {
      const mappedUserDatas = fetchedUserDatas.reduce<Record<string, SockbaseAccountDocument>>((p, c) => ({
        ...p,
        [c.userId]: c.data
      }), {})
      return mappedUserDatas
    })
    .catch(err => { throw err })

  firestore.runTransaction(async tx => {
    targetApps.forEach(app => {
      const user = userDatas[app.userId]

      const template = mailConfig.templates.sendManuallyForEvent(
        payload.subject,
        payload.body,
        event,
        app,
        user)

      const mailRef = firestore.collection('_mails').doc()
      tx.create(mailRef, {
        to: user.email,
        replyTo: payload.replyTo,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
    })

    if (payload.cc) {
      const dummyApp: SockbaseApplicationDocument = {
        id: '',
        eventId: '',
        userId: '',
        spaceId: '',
        circle: {
          name: '送信控え',
          genre: '',
          yomi: '',
          penName: '',
          penNameYomi: '',
          hasAdult: false
        },
        unionCircleId: '',
        overview: {
          totalAmount: '',
          description: ''
        },
        petitCode: '',
        paymentMethod: '',
        remarks: '',
        createdAt: null,
        updatedAt: null,
        hashId: ''
      }
      const dummyUser: SockbaseAccountDocument = {
        id: '',
        email: '',
        name: '送信 太郎',
        birthday: 0,
        postalCode: '',
        address: '',
        telephone: '',
        gender: 1
      }
      const mailRef = firestore.collection('_mails').doc()
      const template = mailConfig.templates.sendManuallyForEvent(
        payload.subject,
        payload.body,
        event,
        dummyApp,
        dummyUser)
      tx.create(mailRef, {
        to: payload.cc,
        replyTo: payload.replyTo,
        message: {
          subject: `${template.subject} (CC)`,
          text: template.body.join('\n')
        }
      })
    }
  })
    .catch(err => { throw err })

  console.log(`${targetApps.length} emails sent.`)

  return true
}

export default {
  sendMailAcceptCircleApplicationAsync,
  sendMailAcceptTicketAsync,
  sendMailUpdateUnionCircleAsync,
  sendMailRequestPaymentAsync,
  sendMailAcceptPaymentAsync,
  sendMailAcceptInquiryAsync,
  sendMailManuallyForEventAsync
}
