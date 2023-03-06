export interface SockbaseEvent {
  eventName: string
  descriptions: string[]
  rules: string[]
  spaces: SockbaseEventSpace[]
  schedules: {
    startApplication: number
    endApplication: number
    publishSpaces: number
    startEvent: number
    endEvent: number
  }
  organization: SockbaseOrganization & {
    id: string
  }
}

export interface SockbaseEventSpace {
  id: string
  name: string
  description: string
  price: number
}

export interface SockbaseOrganization {
  name: string
  contactUrl: string
}

export interface SockbaseApplication {
  eventId: string
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
  paymentMethod: string
  remarks: string
}
export type CircleGenreType = ''
export type SockbaseApplicationDocument = SockbaseApplication & {
  userId: string
  timestamp: number
  hashId: string | null
}

export interface SockbaseAccount {
  name: string
  birthday: number
  postalCode: string
  address: string
  telephone: string
}

export type SockbaseAccountSecure = SockbaseAccount & {
  email: string
  password: string
  rePassword: string
}

export type valueOf<T> = T[keyof T]
