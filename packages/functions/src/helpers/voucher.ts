import { VoucherAppliedAmount } from 'sockbase'

const calculatePaymentAmount = (price: number, voucherAmount: number | null | undefined): VoucherAppliedAmount => {
  if (voucherAmount === undefined) {
    return {
      spaceAmount: price,
      voucherAmount: null,
      paymentAmount: price
    }
  }
  const discountAmount = voucherAmount ?? price
  return {
    spaceAmount: price,
    voucherAmount: discountAmount,
    paymentAmount: price - discountAmount
  }
}

export {
  calculatePaymentAmount
}
