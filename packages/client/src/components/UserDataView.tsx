import { useMemo } from 'react'
import useDayjs from '../hooks/useDayjs'
import type { SockbaseAccount, SockbaseAccountSecure } from 'sockbase'

interface Props {
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
}
const UserDataView: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const displayGender = useMemo(() => {
    const genderCode = props.fetchedUserData?.gender ?? props.userData?.gender
    if (!genderCode) return
    if (genderCode === 1) {
      return '男性'
    } else if (genderCode === 2) {
      return '女性'
    }
  }, [props.fetchedUserData, props.userData])

  return (
    <>
      <h2>申し込み者情報</h2>
      <table>
        <tbody>
          <tr>
            <th>氏名</th>
            <td>{props.fetchedUserData?.name ?? props.userData?.name}</td>
          </tr>
          <tr>
            <th>性別</th>
            <td>{displayGender}</td>
          </tr>
          <tr>
            <th>生年月日</th>
            <td>{formatByDate(props.fetchedUserData?.birthday ?? props.userData?.birthday ?? 0, 'YYYY/MM/DD')}</td>
          </tr>
          <tr>
            <th>郵便番号</th>
            <td>{props.fetchedUserData?.postalCode ?? props.userData?.postalCode}</td>
          </tr>
          <tr>
            <th>住所</th>
            <td>{props.fetchedUserData?.address ?? props.userData?.address}</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>{props.fetchedUserData?.telephone ?? props.userData?.telephone}</td>
          </tr>
        </tbody>
      </table>

      <h2>Sockbaseログイン情報</h2>
      <table>
        <tbody>
          <tr>
            <th>メールアドレス</th>
            <td>{props.fetchedUserData?.email ?? props.userData?.email}</td>
          </tr>
          <tr>
            <th>パスワード</th>
            <td>セキュリティ保護のため非表示</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default UserDataView
