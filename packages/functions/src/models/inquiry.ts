export const convertTypeText: (type: string) => string =
  (type) => {
    if (type === 'changeCircleInfo') {
      return 'サークル申し込み情報変更'
    } else if (type === 'payment') {
      return '決済に関する相談'
    } else if (type === 'changePassword') {
      return 'パスワード再設定依頼'
    } else if (type === 'removeAccount') {
      return 'アカウント消去依頼'
    } else if (type === 'other') {
      return 'その他'
    } else {
      return type
    }
  }
