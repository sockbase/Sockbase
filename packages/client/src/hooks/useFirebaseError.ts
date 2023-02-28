interface IUseFirebaseError {
  parse: (errorMessage: string) => string
}
const useFirebaseError: () => IUseFirebaseError =
  () => {
    const parse: (errorMessage: string) => string =
      (errorMessage) => {
        const message = errorMessage.includes('auth/wrong-password')
          ? 'メールアドレスまたはパスワードが違います'
          : errorMessage.includes('auth/user-not-found')
            ? 'ユーザが見つかりません'
            : errorMessage
        return message
      }

    return {
      parse
    }
  }

export default useFirebaseError
