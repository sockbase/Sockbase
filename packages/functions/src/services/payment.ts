import { type PaymentMethod, type SockbasePaymentDocument } from 'sockbase'
import firebaseAdmin from '../libs/FirebaseAdmin'
import { paymentConverter } from '../libs/converters'
import dayjs from '../helpers/dayjs'

export const createPayment = async (
  userId: string,
  paymentMethod: PaymentMethod,
  bankTransferCode: string,
  paymentProductId: string,
  paymentAmount: number,
  targetType: 'circle' | 'ticket',
  targetId: string
): Promise<string> => {
  const now = new Date()

  const payment: SockbasePaymentDocument = {
    userId,
    paymentProductId,
    paymentAmount,
    paymentMethod,
    bankTransferCode,
    applicationId: targetType === 'circle' ? targetId : null,
    ticketId: targetType === 'ticket' ? targetId : null,
    createdAt: now,
    updatedAt: null,
    id: '',
    paymentId: '',
    status: 0
  }

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const firestore = adminApp.firestore()

  const result = await firestore
    .collection('_payments')
    .withConverter(paymentConverter)
    .add(payment)

  return result.id
}

export const generateBankTransferCode: (now: Date) => string =
  (now) => dayjs(now).tz().format('DDHHmm')
