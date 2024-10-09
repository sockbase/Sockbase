import type { SockbaseEventDocument } from 'sockbase'

const getEventByIdAsync = async (eventId: string): Promise<SockbaseEventDocument> => {
  const dummy = {
    id: eventId,
    name: 'string',
    websiteURL: 'string',
    venue: {
      name: 'string'
    },
    descriptions: ['string'],
    rules: ['string'],
    spaces: [
      {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 0,
        productInfo: null,
        isDualSpace: true,
        passCount: 0,
        acceptApplication: null
      }
    ],
    genres: [
      {
        id: 'string',
        name: 'string'
      }
    ],
    passConfig: {
      storeId: 'string',
      typeId: 'string'
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
      id: 'string',
      name: 'string',
      contactUrl: 'string'
    },
    permissions: {
      allowAdult: false,
      canUseBankTransfer: false
    },
    isPublic: true
  }

  return dummy
}

const eventLib = {
  getEventByIdAsync
}

export default eventLib
