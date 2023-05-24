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
  _organization: SockbaseOrganization & {
    id: string
  }
}

export interface SockbaseEventSpace {
  id: string
  name: string
  description: string
  price: number
  paymentProductId?: string
}

export interface SockbaseStore {
  storeName: string
  descriptions: string[]
  rules: string[]
  types: SockbaseStoreType[]
  schedules: {
    startApplication: number
    endApplication: number
    startEvent: number
    endEvent: number
  }
  _organization: SockbaseOrganization & {
    id: string
  }
}

export interface SockbaseStoreType {
  id: string
  name: string
  description: string
  price: number
  paymentProductId?: string
}

export interface SockbaseOrganization {
  name: string
  contactUrl: string
}

export type SockbaseOrganizationWithMeta = SockbaseOrganization & {
  config: {
    discordWebhookURL: string
  }
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
  paymentProductId?: string
  remarks: string
}

export type CircleGenreType = ''
export type SockbaseApplicationDocument = SockbaseApplication & {
  userId: string
  timestamp: number
  hashId: string | null
}

export interface SockbaseApplicationAddedResult {
  hashId: string
  bankTransferCode?: string
}

export interface SockbaseApplicationMeta {
  applicationStatus: SockbaseApplicationStatus
}
export type SockbaseApplicationStatus = 0 | 1 | 2

export interface SockbaseTicketApplication {
  storeId: string
  typeId: string
  paymentMethod: string
  paymentProductId?: string
  remarks: string
}
export type SockbaseTicketApplicaitonDocument = SockbaseTicketApplication & {
  userId: string
  timestamp: number
  hashId: string | null
}

export interface SockbaseAccount {
  name: string
  email: string
  isEmailVerified?: boolean
  birthday: number
  postalCode: string
  address: string
  telephone: string
}

export type SockbaseAccountSecure = SockbaseAccount & {
  password: string
  rePassword: string
}

export type SockbaseAccountDocument = SockbaseAccount & {
  id: string
}

export type SockbaseRole = 0 | 1 | 2

/**
 * PaymentType
 *
 * online: 1
 * bankTransfer: 2
 */
export type PaymentMethod = 1 | 2

/**
 * PaymentStatus
 *
 * pending: 0
 * paid: 1
 * refunded: 2
 * paymentFailure: 3
 */
export type PaymentStatus = 0 | 1 | 2 | 3

export interface SockbasePayment {
  userId: string
  paymentProductId: string
  paymentMethod: PaymentMethod
  paymentAmount: number
  bankTransferCode: string
  applicationId: string | null
  ticketId: string | null
}

export type SockbasePaymentDocument = SockbasePayment & {
  id: string
  paymentId: string
  status: PaymentStatus
  createdAt: number
  updatedAt: number
}

export type valueOf<T> = T[keyof T]
