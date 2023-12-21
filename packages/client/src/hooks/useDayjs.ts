import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

interface IUseDayjs {
  formatByDate: (
    date: string | number | Date | dayjs.Dayjs | null | undefined,
    format: string
  ) => string
}

const useDayjs = (): IUseDayjs => {
  dayjs.extend(utc)
  dayjs.extend(timezone)

  dayjs.tz.setDefault('Asia/Tokyo')

  const formatByDate = (
    date: string | number | Date | dayjs.Dayjs | null | undefined,
    format: string
  ): string => dayjs(date).tz().format(format)

  return {
    formatByDate
  }
}

export default useDayjs
