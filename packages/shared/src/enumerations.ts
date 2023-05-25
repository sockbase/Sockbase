const enumerations = {
  application: {
    status: {
      provisional: 0,
      canceled: 1,
      confirmed: 2
    }
  },
  user: {
    permissionRoles: {
      user: 0,
      staff: 1,
      admin: 2
    }
  },
  payment: {
    paymentType: {
      online: 1,
      bankTransfer: 2
    },
    status: {
      pending: 0,
      paid: 1,
      refunded: 2,
      paymentFailure: 3
    }
  }
} as const

export default enumerations
