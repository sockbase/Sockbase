interface IUseError {
  convertErrorMessage: (error: Error) => string
}
const useError = (): IUseError => {
  const convertErrorMessage = (error: Error): string => {
    const errorMessage = error.message
    const errorMessagesMap: Record<string, string> = {
      'auth/wrong-password': 'メールアドレスまたはパスワードが間違っています',
      'auth/user-not-found': 'メールアドレスまたはパスワードが間違っています',
      'auth/invalid-login-credentials': 'メールアドレスまたはパスワードが間違っています',
      'auth/email-already-in-use': 'メールアドレスが既に使われているため、アカウントを作成することができませんでした。',
      'auth/too-many-requests': 'ログインに複数回失敗したためアカウントがロックされました。パスワードを再設定してください。',
      'internal': '内部エラーが発生しました',
      'INTERNAL': '内部エラーが発生しました',
      'application_already_exists': '二重申し込みはできません',
      'out_of_term': '申し込み期間外のため申し込むことができませんでした',
      'application_invalid_unionCircleId': '隣接配置先サークルの申し込みIDが間違っています',
      'application_already_union': '隣接希望サークルが他のサークルとの隣接を希望しているため、申し込みできませんでした。',
      'invalid_union_different_event': '別イベントに参加しているサークルとの隣接希望は受け付けられません',
      'user_not_found': 'ユーザが見つかりませんでした',
      'Missing or insufficient permissions.': '権限がありません',
      'firebase-app-check-token-is-invalid': '認証エラーです。キャッシュクリアや再読み込みすると解消する場合があります。',
      'invalid-action-code': 'トークンが無効です。',
      'invalid_argument': `不正なリクエストです: ${errorMessage}`
    }

    const matchedErrorKey = Object.keys(errorMessagesMap)
      .find(key => errorMessage.includes(key))
    if (matchedErrorKey) {
      return errorMessagesMap[matchedErrorKey]
    }

    return `不明なエラーです: ${errorMessage}`
  }

  return {
    convertErrorMessage
  }
}

export default useError
