export interface SockbaseEvent {
  eventName: string
  descriptions: string[]
  spaces: SockbaseEventSpace[]
}

export interface SockbaseEventSpace {
  id: string
  name: string
  description: string
  price: number
}

export interface SockbaseCircleApplication {
  spaceId: string
  circle: {
    name: string
    yomi: string
    penName: string
    penNameYomi: string
    hasAdult: boolean | null
    genre: string
  }
  overview: {
    description: string
    totalAmount: string
  }
  unionCircleId: string
  petitCode: string
  leader: {
    name: string
    birthday: string
    postalCode: string
    address: string
    telephone: string
    email: string
    password: string
    rePassword: string
  }
  paymentMethod: string
  remarks: string
}
export type CircleGenreType = ''
export type SockbaseCircleApplicationDocument = SockbaseCircleApplication & {
  eventId: string
}

export interface SockbaseAccount {
  name: string
  postalCode: string
  address: string
  birthday: number
}
