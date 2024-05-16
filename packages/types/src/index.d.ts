export type valueOf<T> = T[keyof T]

/**
 * イベント
 */
export interface SockbaseEvent {
  eventName: string
  eventWebURL: string
  descriptions: string[]
  rules: string[]
  spaces: SockbaseEventSpace[]
  genres: SockbaseEventGenre[]
  schedules: {
    startApplication: number
    endApplication: number
    overviewFirstFixedAt: number
    publishSpaces: number
    catalogInformationFixedAt: number
    overviewFinalFixedAt: number
    startEvent: number
    endEvent: number
  }
  _organization: SockbaseOrganization & {
    id: string
  }
  permissions: {
    allowAdult: boolean
    canUseBankTransfer: boolean
  }
  isPublic: boolean
}

/**
 * イベント(DB取得)
 */
export type SockbaseEventDocument = SockbaseEvent & {
  id: string
}

/**
 * スペース
 */
export interface SockbaseEventSpace {
  id: string
  name: string
  description: string
  price: number
  productInfo: {
    productId: string
    paymentURL: string
  } | null
  isDualSpace: boolean
}

/**
 * ジャンル
 */
export interface SockbaseEventGenre {
  id: string
  name: string
}

/**
 * チケットストア
 */
export interface SockbaseStore {
  storeName: string
  storeWebURL: string
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
  permissions: {
    canUseBankTransfer: boolean
    ticketUserAutoAssign: boolean
  }
  isPublic: boolean
}

/**
 * チケットストア(DB取得)
 */
export type SockbaseStoreDocument = SockbaseStore & {
  id: string
}

/**
 * チケット種類
 */
export interface SockbaseStoreType {
  id: string
  name: string
  description: string
  price: number
  productInfo: {
    productId: string
    paymentURL: string
  } | null
  color: string
  private: boolean
}

/**
 * 組織
 */
export interface SockbaseOrganization {
  name: string
  contactUrl: string
}

/**
 * 組織設定
 */
export type SockbaseOrganizationWithMeta = SockbaseOrganization & {
  config: {
    discordWebhookURL: string
    discordRoleId: string
  }
}

/**
 * サークル申し込み情報
 */
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
  overview: SockbaseApplicationOverview
  unionCircleId: string
  petitCode: string
  paymentMethod: string
  paymentProductId?: string
  remarks: string
}

/**
 * ジャンルタイプ
 */
export type CircleGenreType = ''

/**
 * サークル申し込み情報(DB取得)
 */
export type SockbaseApplicationDocument = SockbaseApplication & {
  id: string
  userId: string
  createdAt: Date | null
  updatedAt: Date | null
  hashId: string | null
}

/**
 * サークル申し込み作成リザルト
 */
export interface SockbaseApplicationAddedResult {
  hashId: string
  bankTransferCode: string
}

/**
 * 申し込み管理情報
 */
export interface SockbaseApplicationMeta {
  applicationStatus: SockbaseApplicationStatus
}

/**
 * サークル申し込みステータス
 *
 * 0: 仮申し込み
 * 1: キャンセル済み
 * 2: 申し込み確定
 */
export type SockbaseApplicationStatus = 0 | 1 | 2

/**
 * サークル広報情報
 */
export interface SockbaseApplicationLinks {
  twitterScreenName: string | null
  pixivUserId: string | null
  websiteURL: string | null
  menuURL: string | null
}

/**
 * サークル広報情報(DB取得)
 */
export type SockbaseApplicationLinksDocument = SockbaseApplicationLinks & {
  id: string
  applicationId: string
  userId: string
}

/**
 * 頒布物概要
 */
export interface SockbaseApplicationOverview {
  description: string
  totalAmount: string
}

/**
 * 頒布物概要(DB取得)
 */
export type SockbaseApplicationOverviewDocument = SockbaseApplicationOverview & {
  id: string
  applicationId: string
  userId: string
}

/**
 * サークル申し込みハッシュ情報
 */
export interface SockbaseApplicationHashIdDocument {
  id: string
  userId: string
  applicationId: string
  hashId: string
  paymentId: string
  spaceId: string | null
  eventId: string
  organizationId: string
}

/**
 * サークル申し込みペイロード
 */
export interface SockbaseApplicationPayload {
  app: SockbaseApplication
  links: SockbaseApplicationLinks
}

/**
 * スペース情報
 */
export interface SockbaseSpace {
  eventId: string
  spaceGroupOrder: number
  spaceOrder: number
  spaceName: string
}

/**
 * スペース情報(DB取得)
 */
export type SockbaseSpaceDocument = SockbaseSpace & {
  id: string
}

/**
 * スペースハッシュ情報
 */
export interface SockbaseSpaceHash {
  eventId: string
}

/**
 * スペースハッシュ情報(DB取得)
 */
export type SockbaseSpaceHashDocument = SockbaseSpaceHash & {
  id: string
}

/**
 * チケット情報
 */
export interface SockbaseTicket {
  storeId: string
  typeId: string
  paymentMethod: string
  paymentProductId?: string
}

/**
 * チケット情報(DB取得)
 */
export type SockbaseTicketDocument = SockbaseTicket & {
  id?: string
  userId: string
  createdAt: Date | null
  updatedAt: Date | null
  hashId: string | null
  createdUserId: string | null
}

/**
 * チケット管理情報
 * 情報はチケットIDで引く
 */
export interface SockbaseTicketMeta {
  applicationStatus: SockbaseTicketStatusType
}

/**
 * チケット申し込みステータス
 *
 * 0: 仮申し込み
 * 1: キャンセル済み
 * 2: 申し込み確定
 */
export type SockbaseTicketStatusType = 0 | 1 | 2

/**
 * チケット利用者情報
 * 情報はチケットハッシュIDで引く
 */
export interface SockbaseTicketUser {
  userId: string
  storeId: string
  typeId: string
  usableUserId: string | null
}

/**
 * チケット利用者情報(DB取得)
 */
export type SockbaseTicketUserDocument = SockbaseTicketUser & {
  hashId: string
  used: boolean
  usedAt: Date | null
}

/**
 * チケット使用状況管理
 * 情報はチケットIDで引く
 */
export interface SockbaseTicketUsedStatus {
  used: boolean
  usedAt: Date | null
}

/**
 * チケットハッシュ情報
 */
export interface SockbaseTicketHashIdDocument {
  ticketId: string
  hashId: string
  paymentId: string | null
}

/**
 * チケット作成リザルト
 */
export interface SockbaseTicketAddedResult {
  hashId: string
  bankTransferCode: string
}

/**
 * チケット作成リザルト(管理用)
 */
export type SockbaseTicketCreatedResult = Omit<SockbaseTicketDocument, 'createdAt' | 'updatedAt'> & {
  email: string
  createdAt: number
}

/**
 * アカウント
 */
export interface SockbaseAccount {
  name: string
  email: string
  birthday: number
  postalCode: string
  address: string
  telephone: string
}

/**
 * アカウント機密情報
 */
export type SockbaseAccountSecure = SockbaseAccount & {
  password: string
  rePassword: string
}

/**
 * アカウント情報(DB取得)
 */
export type SockbaseAccountDocument = SockbaseAccount & {
  id: string
}

/**
 * ロール
 *
 * 0: 通常ユーザ
 * 1: スタッフ
 * 2: 管理者
 */
export type SockbaseRole = 0 | 1 | 2

/**
 * 決済方法
 *
 * online: 1
 * bankTransfer: 2
 */
export type PaymentMethod = 1 | 2

/**
 * 決済ステータス
 *
 * pending: 0
 * paid: 1
 * refunded: 2
 * paymentFailure: 3
 * cancel: 4
 */
export type PaymentStatus = 0 | 1 | 2 | 3 | 4

/**
 * 決済情報
 */
export interface SockbasePayment {
  userId: string
  paymentProductId: string
  paymentMethod: PaymentMethod
  paymentAmount: number
  bankTransferCode: string
  applicationId: string | null
  ticketId: string | null
}

/**
 * 決済情報(DB取得)
 */
export type SockbasePaymentDocument = SockbasePayment & {
  id: string
  paymentId: string
  status: PaymentStatus
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * 問い合わせ情報
 */
export interface SockbaseInquiry {
  userId: string
  inquiryType: string
  body: string
}

/**
 * 問い合わせ情報(DB取得)
 */
export type SockbaseInquiryDocument = SockbaseInquiry & SockbaseInquiryMetaDocument & {
  id: string
}

/**
 * 問い合わせ情報(管理用)
 */
export interface SockbaseInquiryMeta {
  status: SockbaseInquiryStatus
}

/**
 * 問い合わせ情報(管理用, DB取得)
 */
export type SockbaseInquiryMetaDocument = SockbaseInquiryMeta & {
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * 問い合わせステータス
 *
 * todo: 0
 * inProgress: 1
 * done: 2
 */
export type SockbaseInquiryStatus = 0 | 1 | 2

export interface SockbaseSendMailPayload {
  subject: string
  body: string[]
}

/**
 * メール送信ペイロード(イベント)
 */
export type SockbaseSendMailForEventPayload = SockbaseSendMailPayload & {
  eventId: string
  target: SockbaseMailSendTarget
}

/**
 * メール送信対象
 */
export interface SockbaseMailSendTarget {
  pending: boolean
  confirmed: boolean
  canceled: boolean
}
