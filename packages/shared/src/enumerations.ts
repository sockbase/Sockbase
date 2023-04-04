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
  }
} as const

export default enumerations
