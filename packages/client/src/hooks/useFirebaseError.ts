interface IUseFirebaseError {
  parse: (errorMessage: string) => string
}
const useFirebaseError: () => IUseFirebaseError =
  () => {
    const parse: (errorMessage: string) => string =
      (errorMessage) => {
        const message = errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')
          ? 'メールアドレスまたはパスワードが間違っています'
          : errorMessage
        return message
      }

    return {
      parse
    }
  }

export default useFirebaseError
