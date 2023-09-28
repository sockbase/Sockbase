const generateRandomCharacters = (length: number): string => {
  const BaseCharacters = '123456789ABCEFGHJKLNPRSTUWXYZabcdefghkmnprstvwxz'
  const CharactersLength = BaseCharacters.length - 1

  const randoms: number[] = []
  for (let i = 0; i < length; i++) {
    randoms.push(Math.round(Math.random() * CharactersLength))
  }

  const characters = randoms
    .map(r => BaseCharacters[r])
    .join('')

  return characters
}

export default {
  generateRandomCharacters
}
