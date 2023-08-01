interface IUseFirebaseError {
  localize: (errorMessage: string) => string
}
const useFirebaseError: () => IUseFirebaseError =
  () => {
    const localize: (errorMessage: string) => string =
      (errorMessage) => {
        if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')) {
          return 'メールアドレスまたはパスワードが間違っています'
        } else if (errorMessage.includes('auth/email-already-in-use')) {
          return 'メールアドレスが既に使われています'
        } else if (errorMessage.includes('internal') || errorMessage.includes('INTERNAL')) {
          return '内部エラーが発生しました'
        } else if (errorMessage.includes('application_already_exists')) {
          return '二重申し込みはできません'
        } else if (errorMessage.includes('out_of_term')) {
          return '申し込み期間外のため申し込むことができませんでした'
        } else if (errorMessage.includes('application_invalid_unionCircleId')) {
          return '隣接配置先サークルの申し込みIDが間違っています'
        } else if (errorMessage.includes('application_already_union')) {
          return '隣接希望サークルが他のサークルとの隣接を希望しているため申請できません。'
        } else if (errorMessage.includes('user_not_found')) {
          return 'ユーザが見つかりませんでした'
        } else if (errorMessage === 'Missing or insufficient permissions.') {
          return '権限がありません'
        } else if (errorMessage.includes('invalid_argument')) {
          return `不正なリクエストです: ${errorMessage}`
        } else {
          return errorMessage
        }
      }

    return {
      localize
    }
  }

export default useFirebaseError
