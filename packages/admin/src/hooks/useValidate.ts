import validator from 'validator'

interface IUseValidate {
  isIn: (value: string, entries: string[]) => boolean
  isEmpty: (value: string) => boolean
  isNotEmpty: (value: string) => boolean
  isMatchRegex: (value: string, regex: RegExp) => boolean
  isNull: <T>(value: T) => boolean
  isOnlyHiragana: (value: string) => boolean
  isPostalCode: (value: string) => boolean
  isDate: (value: string) => boolean
  isEmail: (value: string) => boolean
  isApplicationHashId: (value: string) => boolean
  isTicketHashId: (value: string) => boolean
  isStrongPassword: (value: string) => boolean
  isTwitterScreenName: (value: string) => boolean
  isURL: (value: string) => boolean
  isOnlyNumber: (value: string) => boolean
  equals: (value1: string, value2: string) => boolean
}
const useValidate = (): IUseValidate => {
  const isIn = (value: string, entries: string[]): boolean =>
    validator.isIn(value, entries)

  const isEmpty = (value: string): boolean => value.trim() === ''

  const isNotEmpty = (value: string): boolean => !isEmpty(value)

  const isMatchRegex: (value: string, regex: RegExp) => boolean = (
    value,
    regex
  ) => regex.test(value)

  const isNull = <T>(value: T): boolean => value === null

  const isOnlyHiragana = (value: string): boolean =>
    isMatchRegex(value, /^[ぁ-んー]+$/)

  const isPostalCode = (value: string): boolean =>
    isMatchRegex(value, /^\d{3}\d{4}$/)

  const isDate = (value: string): boolean => validator.isDate(value)

  const isEmail = (value: string): boolean => validator.isEmail(value)

  const isApplicationHashId = (value: string): boolean =>
    isMatchRegex(value, /^(\d{17}-[0-9a-f]{8})|(SC\d{4}[0-9A-Z]{12})$/)

  const isTicketHashId = (value: string): boolean =>
    isMatchRegex(value, /^(\d{17}-[1-9A-Za-z]{32})|(ST\d{4}[0-9A-Z]{12})$/)

  const isStrongPassword = (value: string): boolean =>
    isMatchRegex(value, /(?=.*[A-Z])[a-zA-Z0-9]+/) && value.length >= 12

  const isTwitterScreenName = (value: string): boolean =>
    isMatchRegex(value, /^[A-Za-z0-9_]{1,16}$/)

  const isOnlyNumber = (value: string): boolean => isMatchRegex(value, /^\d+$/)

  const isURL = (value: string): boolean =>
    isMatchRegex(value, /^http(s)?:\/\//)

  const equals = (value1: string, value2: string): boolean => value1 === value2

  return {
    isIn,
    isEmpty,
    isNotEmpty,
    isMatchRegex,
    isNull,
    isOnlyHiragana,
    isPostalCode,
    isDate,
    isEmail,
    isTicketHashId,
    isApplicationHashId,
    isStrongPassword,
    isTwitterScreenName,
    isOnlyNumber,
    isURL,
    equals
  }
}

export default useValidate
