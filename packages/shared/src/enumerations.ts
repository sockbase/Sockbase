const enumerations = {
  application: {
    status: {
      provisional: 0,
      canceled: 1,
      confirmed: 2
    }
  }
} as const

export default enumerations
