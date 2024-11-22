import { type PaymentMethod, type SockbasePaymentDocument } from 'sockbase'
import dayjs from '../helpers/dayjs'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { paymentConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const createPaymentAsync = async (
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
    status: 0,
    paymentResult: null
  }
  const result = await firestore
    .collection('_payments')
    .withConverter(paymentConverter)
    .add(payment)

  return result.id
}

const generateBankTransferCode: (now: Date) => string =
  (now) => dayjs(now).tz().format('DDHHmm')

export default {
  createPaymentAsync,
  generateBankTransferCode
}
