import type { SockbaseCircleListControlDocument } from 'sockbase'

const getListControlsAsync = async (): Promise<SockbaseCircleListControlDocument[]> => {
  const dummy: SockbaseCircleListControlDocument[] = [
    {
      id: 'dummy1',
      eventId: 'dummyEvent1',
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
