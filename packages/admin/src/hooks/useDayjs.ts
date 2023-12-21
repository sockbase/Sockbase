import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

type FormatDate = string | number | Date | dayjs.Dayjs | null | undefined

interface IUseDayjs {
  formatByDate: (date: FormatDate, format: string) => string
  formatDateTime: (date: FormatDate) => string
}

const useDayjs = (): IUseDayjs => {
  dayjs.extend(utc)
  dayjs.extend(timezone)

  dayjs.tz.setDefault('Asia/Tokyo')

  const formatByDate = (date: FormatDate, format: string): string =>
    dayjs(date).tz().format(format)

  const formatDateTime = (date: FormatDate): string =>
    dayjs(date).tz().format('YYYY年M月D日 h時mm分')

  return {
    formatByDate,
    formatDateTime
  }
}

export default useDayjs
