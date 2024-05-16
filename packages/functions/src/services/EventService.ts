import { https } from 'firebase-functions/v1'
import { type SockbaseTicketDocument, type SockbaseAccountDocument, type SockbaseApplicationMeta } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { ticketConverter, userConverter } from '../libs/converters'
import { getApplicationMetaByAppIdAsync, getApplicationsByEventIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getUserDataAsync } from '../models/user'
import { generateTicketHashId } from './StoreService'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const createPassesAsync = async (userId: string, eventId: string): Promise<number> => {
  const now = new Date()

  const event = await getEventByIdAsync(eventId)
  const fetchedApps = await getApplicationsByEventIdAsync(eventId)

  if (!event.passConfig?.storeId || !event.passConfig?.typeId) {
    throw new https.HttpsError('not-found', 'passConfig')
  }

  const store = await getStoreByIdAsync(event.passConfig.storeId)
  const type = store.types.filter(t => t.id === event.passConfig?.typeId)[0]
  if (!type) {
    throw new https.HttpsError('not-found', 'store')
  }

  const storeId = store.id
  const typeId = type.id

  const appIds = fetchedApps.map(a => a.id)
  const appMetas = await Promise.all(appIds.map(async id => ({
    id,
    data: await getApplicationMetaByAppIdAsync(id)
  })))
    .then(fetchedAppMetas => {
      const mappedAppMetas = fetchedAppMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
        ...p,
        [c.id]: c.data
      }), {})
      return mappedAppMetas
    })

  const apps = fetchedApps
    .filter(a => appMetas[a.id].applicationStatus === 2)

  const ticketsToCreate = apps.map(a => ({
    targetUserId: a.userId,
    passCount: event.spaces.filter(s => s.id === a.spaceId)[0].passCount ?? 0
  }))

  const userIds = ticketsToCreate.map(t => t.targetUserId)
  const userDatas = await Promise.all(userIds.map(async id => ({
    id,
    data: await getUserDataAsync(id)
  })))
    .then(fetchedUserDatas => {
      const mappedUserDatas = fetchedUserDatas.reduce<Record<string, SockbaseAccountDocument>>((p, c) => ({
        ...p,
        [c.id]: c.data
      }), {})
      return mappedUserDatas
    })

  const addedCount = await Promise.all(ticketsToCreate.map(async t => {
    const userData = userDatas[t.targetUserId]
    await firestore
      .doc(`stores/${storeId}/_users/${t.targetUserId}`)
      .withConverter(userConverter)
      .set(userData)

    for (let i = 0; i < t.passCount; i++) {
      const hashId = generateTicketHashId(now)
      const ticketDoc: SockbaseTicketDocument = {
        storeId,
        typeId,
        paymentMethod: 'online',
        userId: t.targetUserId,
        createdAt: now,
        updatedAt: null,
        hashId,
        createdUserId: userId
      }

      const ticketResult = await firestore
        .collection('_tickets')
        .withConverter(ticketConverter)
        .add(ticketDoc)
      const ticketId = ticketResult.id

      await firestore
        .doc(`_tickets/${ticketId}/private/meta`)
        .set({ applicationStatus: 2 })

      await firestore
        .doc(`_tickets/${ticketId}/private/usedStatus`)
        .set({
          used: false,
          usedAt: null
        })

      await firestore
        .doc(`_ticketHashIds/${hashId}`)
        .set({
          hashId,
          ticketId,
          paymentId: null
        })

      await firestore
        .doc(`_ticketUsers/${hashId}`)
        .set({
          userId: t.targetUserId,
          storeId,
          typeId,
          usableUserId: null,
          used: false,
          usedAt: null
        })
    }

    return t.passCount
  }))
    .then(addedResults => addedResults.reduce((p, c) => p + c, 0))

  return addedCount
}

export default {
  createPassesAsync
}
