import validator from 'validator'

interface IUseValidate {
  isIn: (value: string, entries: string[]) => boolean
  isEmpty: (value: string) => boolean
  isMatchRegex: (value: string, regex: RegExp) => boolean
  isNull: <T>(value: T) => boolean
  isOnlyHiragana: (value: string) => boolean
  isPostalCode: (value: string) => boolean
  isDate: (value: string) => boolean
  isEmail: (value: string) => boolean
  equals: (value1: string, value2: string) => boolean
}
const useValidate: () => IUseValidate =
  () => {
    const isIn: (value: string, entries: string[]) => boolean =
      (value, entries) => validator.isIn(value, entries)

    const isEmpty: (value: string) => boolean =
      (value) => value.trim() === ''

    const isMatchRegex: (value: string, regex: RegExp) => boolean =
      (value, regex) => regex.test(value)

    const isNull: <T>(value: T) => boolean =
      (value) => value === null

    const isOnlyHiragana: (value: string) => boolean =
      (value) => isMatchRegex(value, /^[ぁ-ん]+$/)

    const isPostalCode: (value: string) => boolean =
      (value) => isMatchRegex(value, /^\d{3}-\d{4}$/)

    const isDate: (value: string) => boolean =
      (value) => validator.isDate(value)

    const isEmail: (value: string) => boolean =
      (value) => validator.isEmail(value)

    const equals: (value1: string, value2: string) => boolean =
      (value1, value2) => value1 === value2

    return {
      isIn,
      isEmpty,
      isMatchRegex,
      isNull,
      isOnlyHiragana,
      isPostalCode,
      isDate,
      isEmail,
      equals
    }
  }

export default useValidate