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
        } else {
          return errorMessage
        }
      }

    return {
      localize
    }
  }

export default useFirebaseError
