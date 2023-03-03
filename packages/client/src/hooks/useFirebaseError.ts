interface IUseFirebaseError {
  localize: (errorMessage: string) => string
}
const useFirebaseError: () => IUseFirebaseError =
  () => {
    const localize: (errorMessage: string) => string =
      (errorMessage) => {
        const message = errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')
          ? 'メールアドレスまたはパスワードが間違っています'
          : errorMessage
        return message
      }

    return {
      localize
    }
  }

export default useFirebaseError
