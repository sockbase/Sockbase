import { type PostalCodeResult } from '../@types'

interface IUsePostalCode {
  getAddressByPostalCode: (postalCode: string) => Promise<string>
}
const usePostalCode: () => IUsePostalCode =
  () => {
    const getAddressByPostalCode: (postalCode: string) => Promise<string> =
      async (postalCode) => {
        const result = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
        const json = await result.json() as PostalCodeResult

        if (!json.results || json.results.length === 0) return ''
        const { address1, address2, address3 } = json.results[0]
        const address = [address1, address2, address3].join('')

        return address
      }

    return {
      getAddressByPostalCode
    }
  }

export default usePostalCode
