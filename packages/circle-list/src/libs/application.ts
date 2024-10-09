import type { SockbaseApplicationDocument, SockbaseApplicationHashIdDocument } from 'sockbase'

const getApplicationsByEventIdAsync = async (eventId: string): Promise<SockbaseApplicationDocument[]> => {
  const createDummyApplication = (id: number): SockbaseApplicationDocument => ({
    id: `dummyApplication${id}`,
    hashId: `dummyHash${id}`,
    userId: `dummyUser${id}`,
    eventId: 'dummyEvent1',
    spaceId: 'dummySpace1',
    circle: {
      name: `ダミーサークル${id}`,
      yomi: `だみーさーくる${id}`,
      penName: `ダミーペンネーム${id}`,
      penNameYomi: `だみーぺんねーむ${id}`,
      hasAdult: false,
      genre: 'dummyGenre1'
    },
    overview: {
      description: `ダミー説明${id}`,
      totalAmount: `ダミー搬入量${id}`
    },
    unionCircleId: `dummyHash${id + 1}`,
    petitCode: `ダミープチオンリー${id}`,
    paymentMethod: 'online',
    remarks: `ダミー備考${id}`,
    createdAt: null,
    updatedAt: null
  })

  return Array.from({ length: 20 }, (_, i) => createDummyApplication(i + 1))
}

const getApplicationHashIdByEventIdAsync = async (eventId: string): Promise<SockbaseApplicationHashIdDocument[]> => {
  const createDummyHashId = (id: number): SockbaseApplicationHashIdDocument => ({
    id: `dummyHash${id}`,
    hashId: `dummyHash${id}`,
    userId: `dummyUser${id}`,
    applicationId: `dummyApplication${id}`,
    paymentId: `dummyPayment${id}`,
    spaceId: `dummySpace${id}`,
    eventId: 'dummyEvent1',
    organizationId: `dummyOrganization${id}`
  })

  return Array.from({ length: 20 }, (_, i) => createDummyHashId(i + 1))
}

const applicationLib = {
  getApplicationsByEventIdAsync,
  getApplicationHashIdByEventIdAsync
}

export default applicationLib
