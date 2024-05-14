interface IUseFirebaseError {
  localize: (errorMessage: string) => string
}
const useFirebaseError = (): IUseFirebaseError => {
  const localize = (errorMessage: string): string => {
    if (
      errorMessage.includes('auth/wrong-password') ||
      errorMessage.includes('auth/user-not-found')
    ) {
      return 'メールアドレスまたはパスワードが間違っています'
    } else if (errorMessage.includes('auth/email-already-in-use')) {
      return 'メールアドレスが既に使われているため、アカウントを作成することができませんでした。'
    } else if (
      errorMessage.includes('internal') ||
      errorMessage.includes('INTERNAL')
    ) {
      return '内部エラーが発生しました'
    } else if (errorMessage.includes('application_already_exists')) {
      return '二重申し込みはできません'
    } else if (errorMessage.includes('out_of_term')) {
      return '申し込み期間外のため申し込むことができませんでした'
    } else if (errorMessage.includes('application_invalid_unionCircleId')) {
      return '隣接配置先サークルの申し込みIDが間違っています'
    } else if (errorMessage.includes('application_already_union')) {
      return '隣接希望サークルが他のサークルとの隣接を希望しているため、申し込みできませんでした。'
    } else if (errorMessage.includes('user_not_found')) {
      return 'ユーザが見つかりませんでした'
    } else if (errorMessage === 'Missing or insufficient permissions.') {
      return '権限がありません'
    } else if (errorMessage.includes('firebase-app-check-token-is-invalid')) {
      return '認証エラーです。キャッシュクリアや再読み込みすると解消する場合があります。'
    } else if (errorMessage.includes('invalid_argument')) {
      return `不正なリクエストです: ${errorMessage}`
    } else {
      return `不明なエラーです: ${errorMessage}`
    }
  }

  return {
    localize
  }
}

export default useFirebaseError
