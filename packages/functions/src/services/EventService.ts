import { https } from 'firebase-functions/v1'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { getApplicationMetaByAppIdAsync, getApplicationsByEventIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getUserDataAsync } from '../models/user'
import StoreService from './StoreService'
import type { SockbaseAccountDocument, SockbaseApplicationMeta, SockbaseTicket } from 'sockbase'

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
    await StoreService.updateTicketUserDataCoreAsync(t.targetUserId, storeId, userData)

    for (let i = 0; i < t.passCount; i++) {
      const ticket: SockbaseTicket = {
        storeId,
        typeId,
        paymentMethod: 'online'
      }

      await StoreService.createTicketCoreAsync(
        t.targetUserId,
        store,
        type,
        ticket,
        false,
        now,
        userId
      )
    }

    return t.passCount
  }))
    .then(addedResults => addedResults.reduce((p, c) => p + c, 0))

  return addedCount
}

export default {
  createPassesAsync
}
