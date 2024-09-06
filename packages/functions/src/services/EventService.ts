import { https } from 'firebase-functions/v1'
import { getApplicationMetaByAppIdAsync, getApplicationsByEventIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getUserDataAsync } from '../models/user'
import StoreService from './StoreService'
import type {
  SockbaseAccountDocument,
  SockbaseApplicationMeta,
  SockbaseCirclePassCreatedResult,
  SockbaseStoreDocument,
  SockbaseStoreType
} from 'sockbase'

const createPassesAsync = async (userId: string, eventId: string): Promise<SockbaseCirclePassCreatedResult> => {
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

  let anotherTicketStore: SockbaseStoreDocument | undefined
  let anotherTicketType: SockbaseStoreType | undefined

  if (type.anotherTicket?.storeId && type.anotherTicket?.typeId) {
    anotherTicketStore = await getStoreByIdAsync(type.anotherTicket.storeId)
      .catch(err => {
        console.error(err)
        throw new https.HttpsError('not-found', 'anotherTicketStore')
      })

    anotherTicketType = anotherTicketStore.types.filter(t => t.id === type.anotherTicket?.typeId)[0]
    if (!anotherTicketType) {
      throw new https.HttpsError('not-found', 'anotherTicketType')
    }
  }

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
    await StoreService.updateTicketUserDataCoreAsync(t.targetUserId, store.id, userData)

    for (let i = 0; i < t.passCount; i++) {
      await StoreService.createTicketCoreAsync(
        t.targetUserId,
        store,
        type,
        1,
        false,
        now,
        userId
      )
    }

    if (anotherTicketStore && anotherTicketType) {
      await StoreService.updateTicketUserDataCoreAsync(t.targetUserId, anotherTicketStore.id, userData)

      for (let i = 0; i < t.passCount; i++) {
        await StoreService.createTicketCoreAsync(
          t.targetUserId,
          anotherTicketStore,
          anotherTicketType,
          1,
          true,
          now,
          userId
        )
      }
    }

    return {
      circlePassCount: t.passCount,
      anotherTicketCount: anotherTicketStore && anotherTicketType
        ? t.passCount
        : 0
    }
  }))
    .then(addedResults => addedResults.reduce<SockbaseCirclePassCreatedResult>(
      (p, c) => ({
        circlePassCount: p.circlePassCount + c.circlePassCount,
        anotherTicketCount: p.anotherTicketCount + c.anotherTicketCount
      }),
      {
        circlePassCount: 0,
        anotherTicketCount: 0
      }))

  return addedCount
}

export default {
  createPassesAsync
}
