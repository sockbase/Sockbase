import type { SockbaseCircleListControlDocument } from 'sockbase'

const getListControlsAsync = async (): Promise<SockbaseCircleListControlDocument[]> => {
  const dummy: SockbaseCircleListControlDocument[] = [
    {
      id: 'dummy',
      eventId: 'dummyEventId',
      isPublic: true,
      type: 0
    }
  ]

  return dummy
}

const listLib = {
  getListControlsAsync
}

export default listLib
