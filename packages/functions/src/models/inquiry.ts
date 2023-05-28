export const convertTypeText: (type: string) => string =
  (type) => {
    if (type === 'other') {
      return 'その他'
    } else {
      return type
    }
  }
