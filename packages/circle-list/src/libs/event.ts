import type { SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

const getEventByIdAsync = async (eventId: string): Promise<SockbaseEventDocument> => {
  const dummy = {
    id: eventId,
    name: 'ダミーイベント',
    websiteURL: 'https://example.com',
    venue: {
      name: 'ダミー会場'
    },
    descriptions: ['string1'],
    rules: ['string1'],
    spaces: [
      {
        id: 'dummySpace1',
        name: 'ダミースペース1',
        description: 'ダミー説明1',
        price: 0,
        productInfo: null,
        isDualSpace: true,
        passCount: 0,
        acceptApplication: null
      }
    ],
    genres: [
      {
        id: 'dummyGenre1',
        name: 'ダミージャンル1'
      }
    ],
    passConfig: {
      storeId: 'ダミーストア',
      typeId: 'ダミータイプ'
    },
    schedules: {
      startApplication: 0,
      endApplication: 0,
      overviewFirstFixedAt: 0,
      publishSpaces: 0,
      catalogInformationFixedAt: 0,
      overviewFinalFixedAt: 0,
      startEvent: 0,
      endEvent: 0
    },
    _organization: {
      id: 'dummyOrganization1',
      name: 'ダミー団体1',
      contactUrl: 'https://example.com'
    },
    permissions: {
      allowAdult: false,
      canUseBankTransfer: false
    },
    isPublic: true
  }

  return dummy
}

const getSpacesByEventIdAsync = async (eventId: string): Promise<SockbaseSpaceDocument[]> => {
  const dummy = Array.from({ length: 20 }, (_, i) => ({
    id: `dummySpace${i + 1}`,
    eventId,
    spaceGroupOrder: 0,
    spaceOrder: i,
    spaceName: `D-${String(i + 1).padStart(2, '0')}`
  }))

  return dummy
}

const eventLib = {
  getEventByIdAsync,
  getSpacesByEventIdAsync
}

export default eventLib
