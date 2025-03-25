import dayjs from '../helpers/dayjs'

const generateBankTransferCode: (now: Date) => string =
  now => dayjs(now).tz().format('DDHHmm')

export {
  generateBankTransferCode
}
