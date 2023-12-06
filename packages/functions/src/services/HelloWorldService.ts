const getHelloWorld = (): string => {
  return 'hello world!'
}

const getPong = (data: object): { data: object, message: string } => {
  return {
    data,
    message: 'pong'
  }
}

export default {
  getHelloWorld,
  getPong
}
