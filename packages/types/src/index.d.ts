export type valueOf<T> = T[keyof T]

/**
 * イベント
 */
export interface SockbaseEvent {
  name: string
  websiteURL: string
  venue: {
    name: string
  }
  descriptions: string[]
  rules: string[]
  spaces: SockbaseEventSpace[]
  genres: SockbaseEventGenre[]
  passConfig?: {
    storeId: string
    typeId: string
  }
  schedules: {
    startApplication: number
    endApplication: number
    overviewFixedAt: number
    publishSpaces: number
    startEvent: number
    endEvent: number
  }
  _organization: SockbaseOrganization & {
    id: string
  }
  permissions: {
    allowAdult: boolean
    canUseBankTransfer: boolean
    requirePetitCode: boolean
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
  isDualSpace: boolean
  passCount?: number
  acceptApplication: boolean | null
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
  name: string
  websiteURL: string
  venue: {
    name: string
  } | null
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
  color: string
  isPublic: boolean
  anotherTicket: {
    storeId: string
    typeId: string
  } | null
}

/**
 * 組織
 */
export interface SockbaseOrganization {
  name: string
  contactUrl: string
}

export type SockbaseOrganizationDocument = SockbaseOrganization & {
  id: string
}

/**
 * 組織設定
 */
export type SockbaseOrganizationWithMeta = SockbaseOrganizationDocument & {
  config: {
    discordWebhookURL: string
    discordRoleId: string
  }
}

export interface SockbaseOrganizationManager {
  role: SockbaseRole
}

export type SockbaseOrganizationManagerDocument = SockbaseOrganizationManager & {
  userId: string
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
    hasAdult: boolean
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
export interface SockbaseApplicationCreateResult {
  hashId: string
  bankTransferCode: string
  checkoutRequest: SockbaseCheckoutRequest | null
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
  voucherId: string | null
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
  id: string
  userId: string | null
  createdAt: Date | null
  updatedAt: Date | null
  hashId: string | null
  createdUserId: string | null
  isStandalone: boolean
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
  userId: string | null
  storeId: string
  typeId: string
  usableUserId: string | null
  isStandalone: boolean
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
 * チケット申し込みペイロード
 */
export interface SockbaseTicketApplyPayload {
  ticket: SockbaseTicket
  voucherId: string | null
}

/**
 * チケット作成リザルト
 */
export interface SockbaseTicketCreateResult {
  hashId: string
  bankTransferCode: string
  checkoutRequest: SockbaseCheckoutRequest | null
}

/**
 * チケット作成リザルト(管理用)
 */
export type SockbaseAdminTicketCreateResult = Omit<SockbaseTicketDocument, 'createdAt' | 'updatedAt'> & {
  email: string
  createdAt: number
}

/**
 * サークル通行証発行リザルト
 */
export interface SockbaseCirclePassCreateResult {
  circlePassCount: number
  anotherTicketCount: number
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
  gender?: SockbaseGender
}

/**
 * 性別
 * 1: 男性
 * 2: 女性
 */
export type SockbaseGender = 1 | 2

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
 * voucher: 3
 */
export type PaymentMethod = 1 | 2 | 3

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
  paymentMethod: PaymentMethod
  paymentAmount: number
  totalAmount: number
  voucherAmount: number
  voucherId: string | null
  bankTransferCode: string
  applicationId: string | null
  ticketId: string | null
}

/**
 * 決済情報(DB取得)
 */
export type SockbasePaymentDocument = SockbasePayment & {
  id: string
  hashId: string
  checkoutSessionId: string
  paymentIntentId: string
  status: PaymentStatus
  checkoutStatus: CheckoutStatus
  cardBrand: string | null
  createdAt: Date | null
  updatedAt: Date | null
  purchasedAt: Date | null
}

/**
 * 決済ハッシュ情報
 */
export interface SockbasePaymentHash {
  userId: string
  paymentId: string
  hashId: string
}
export type SockbasePaymentHashDocument = SockbasePaymentHash & {
  id: string
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
  cc: string
  replyTo: string | null
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

/**
 * お知らせ
 */
export interface SockbaseInformation {
  title: string
  body: string
  updatedAt: number
  isPublished: boolean
}

/**
 * お知らせ(DB取得)
 */
export type SockbaseInformationDocument = SockbaseInformation & {
  id: string
}

/**
 * サークルリスト制御
 */
export interface SockbaseCircleListControl {
  eventId: string | null
  eventIds: string[] | null
  isPublic: boolean
  type: CircleListType
  dualSpaceCircleCutType: DualSpaceCircleCutType
  showEventName: boolean
}

/**
 * サークルリスト制御(DB取得)
 */
export type SockbaseCircleListControlDocument = SockbaseCircleListControl & {
  id: string
}

/**
 * サークルリストの種類
 * 0: 50音順
 * 1: スペース番号順
 */
export type CircleListType = 0 | 1

/**
 * 2sp サークルカットの種類
 * 1: 1sp 幅
 * 2: 2sp 幅
 */
export type DualSpaceCircleCutType = 1 | 2

/**
 * 資料リンク
 */
export interface SockbaseDocLink {
  eventId: string
  name: string
  url: string
  order: number
}

/**
 * 資料リンク(DB取得)
 */
export type SockbaseDocLinkDocument = SockbaseDocLink & {
  id: string
}

/**
 * 決済リクエスト
 */
export interface SockbaseCheckoutRequest {
  paymentMethod: PaymentMethod
  checkoutURL: string
  amount: number
}

/**
 * 決済情報取得ペイロード
 */
export interface SockbaseCheckoutGetPayload {
  sessionId: string
}

/**
 * 決済結果
 */
export interface SockbaseCheckoutResult {
  status: CheckoutStatus | -1
  applicaitonHashId: string | null
  ticketHashId: string | null
}

/**
 * 決済要求ステータス
 * 0: 開始 (決済要求を作成した)
 * 1: 決済完了
 * 2: 終了 (決済完了ページを踏んだ)
 */
export type CheckoutStatus = 0 | 1 | 2

/**
 * バウチャー
 */
export interface SockbaseVoucher {
  amount: number | null
  targetType: VoucherTargetType
  targetId: string
  targetTypeId: string | null
  usedCount: number
  usedCountLimit: number | null
}

/**
 * バウチャー(DB取得)
 */
export type SockbaseVoucherDocument = SockbaseVoucher & {
  id: string
  createdAt: Date
  updatedAt: Date | null
}

/**
 * バウチャーコード
 */
export interface SockbaseVoucherCode {
  voucherId: string
}

/**
 * バウチャーコード(DB取得)
 */
export type SockbaseVoucherCodeDocument = SockbaseVoucherCode & {
  id: string
}

/**
 * バウチャー対象
 * 1: イベント
 * 2: チケットストア
 */
export type VoucherTargetType = 1 | 2

/**
 * 領収書設定
 */
export interface SockbaseReceiptConfig {
  name: string
  websiteURL: string
  email: string
  registrationNumber: string
}

/**
 * バウチャー計算
 */
export interface VoucherAppliedAmount {
  spaceAmount: number,
  voucherAmount: number | null,
  paymentAmount: number
}
