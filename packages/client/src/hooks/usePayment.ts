import type { SockbasePaymentDocument } from 'sockbase'
interface IUsePayment {
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
}
const usePayment: () => IUsePayment =
  () => {
    const getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]> =
      async (userId) => {
        const result: SockbasePaymentDocument[] = [{
          id: '0',
          paymentId: '1',
          paymentProductId: 'a',
          paymentMethod: 1,
          paymentAmount: 10,
          bankTransferCode: '123456',
          applicationId: 'a',
          ticketId: null,
          status: 0,
          createdAt: 0,
          updatedAt: 0,
          userId: 'abcdefg'
        }]
        return result
      }

    return {
      getPaymentsByUserId
    }
  }

export default usePayment
