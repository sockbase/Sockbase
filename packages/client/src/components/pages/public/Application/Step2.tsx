import { useState, useEffect } from 'react'

import type { SockbaseApplication, SockbaseAccountSecure, SockbaseEventSpace, SockbaseAccount, SockbaseEventGenre, SockbaseEvent } from 'sockbase'
import sockbaseShared from 'shared'

import useFirebaseError from '../../../../hooks/useFirebaseError'

import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'
import FormButton from '../../../Form/Button'
import Alert from '../../../Parts/Alert'
import CircleCutImage from '../../../Parts/CircleCutImage'
import LoadingCircleWrapper from '../../../Parts/LoadingCircleWrapper'

interface Props {
  app: SockbaseApplication | undefined
  event: SockbaseEvent
  leaderUserData: SockbaseAccountSecure | undefined
  circleCutData: string | undefined
  userData: SockbaseAccount | null
  submitApplication: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  const { localize: localizeFirebaseError } = useFirebaseError()

  const [spaceInfo, setSpaceInfo] = useState<SockbaseEventSpace>()
  const [paymentMethodInfo, setPaymentMethodInfo] = useState<{ id: string, description: string }>()
  const [genreInfo, setGenreInfo] = useState<SockbaseEventGenre>()

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<Error | null>()

  const onChangeSpaceSelect: () => void =
    () => {
      if (!props.app || !props.event.spaces) return
      const space = props.event.spaces
        .filter(s => s.id === props.app?.spaceId)[0]
      setSpaceInfo(space)

      const paymentMethod = sockbaseShared.constants.payment.methods
        .filter(p => p.id === props.app?.paymentMethod)[0]
      setPaymentMethodInfo(paymentMethod)

      const genre = props.event.genres
        .filter(g => g.id === props.app?.circle.genre)[0]
      setGenreInfo(genre)
    }
  useEffect(onChangeSpaceSelect, [props.app, props.event, props])

  const handleSubmit: () => void =
    () => {
      setProgress(true)
      setError(null)

      props.submitApplication()
        .then(() => {
          props.nextStep()
        })
        .catch((err: Error) => {
          setError(new Error(localizeFirebaseError(err.message)))
          throw err
        })
        .finally(() => {
          setProgress(false)
        })
    }

  return (
    <>
      {
        props.app && props.leaderUserData && <>
          <h1>入力内容確認</h1>

          <h2>サークルカット</h2>
          <FormSection>
            <FormItem>
              {props.circleCutData && <CircleCutImage src={props.circleCutData} />}
            </FormItem>
          </FormSection>

          <h2>サークル情報</h2>
          <table>
            <tbody>
              <tr>
                <th>サークル名</th>
                <td>{props.app.circle.name}</td>
              </tr>
              <tr>
                <th>サークル名(よみ)</th>
                <td>{props.app.circle.yomi}</td>
              </tr>
              <tr>
                <th>ペンネーム</th>
                <td>{props.app.circle.penName}</td>
              </tr>
              <tr>
                <th>ペンネーム(よみ)</th>
                <td>{props.app.circle.penNameYomi}</td>
              </tr>
            </tbody>
          </table>

          <h2>頒布物情報</h2>
          <table>
            <tbody>
              {props.event.permissions.allowAdult && <tr>
                <th>成人向け頒布物の有無</th>
                <td>{props.app.circle.hasAdult
                  ? '成人向け頒布物があります'
                  : '成人向け頒布物はありません'}</td>
              </tr>}
              <tr>
                <th>頒布物のジャンル</th>
                <td>{genreInfo?.name}</td>
              </tr>
              <tr>
                <th>頒布物概要</th>
                <td>{props.app.overview.description}</td>
              </tr>
              <tr>
                <th>総搬入量</th>
                <td>{props.app.overview.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <h2>隣接配置希望(合体)情報</h2>
          <table>
            <tbody>
              <tr>
                <th>合体希望サークル 合体申し込みID</th>
                <td>{props.app.unionCircleId || '(空欄)'}</td>
              </tr>
              <tr>
                <th>プチオンリーコード</th>
                <td>{props.app.petitCode || '(空欄)'}</td>
              </tr>
            </tbody>
          </table>

          <h2>申し込み責任者情報</h2>
          <table>
            <tbody>
              <tr>
                <th>氏名</th>
                <td>{props.userData?.name ?? props.leaderUserData.name}</td>
              </tr>
              <tr>
                <th>生年月日</th>
                <td>{new Date(props.userData?.birthday ?? props.leaderUserData.birthday).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>郵便番号</th>
                <td>{props.userData?.postalCode ?? props.leaderUserData.postalCode}</td>
              </tr>
              <tr>
                <th>住所</th>
                <td>{props.userData?.address ?? props.leaderUserData.address}</td>
              </tr>
              <tr>
                <th>電話番号</th>
                <td>{props.userData?.telephone ?? props.leaderUserData.telephone}</td>
              </tr>
            </tbody>
          </table>

          <h2>通信欄</h2>
          <p>
            {props.app.remarks || '(空欄)'}
          </p>

          <h2>サークル参加費</h2>
          <h3>選択されたスペース</h3>
          <table>
            <tbody>
              <tr>
                <th>スペース</th>
                <td>{spaceInfo?.name}</td>
              </tr>
              <tr>
                <th>詳細</th>
                <td>{spaceInfo?.description}</td>
              </tr>
              <tr>
                <th>参加費</th>
                <td>{spaceInfo?.price.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>

          <h3>決済方法</h3>
          <p>
            {paymentMethodInfo?.description}
          </p>

          <h1>申し込み情報送信</h1>
          <p>
            上記の内容で正しければ「決済に進む(申し込み情報送信)」ボタンを押してください。
          </p>
          <p>
            修正する場合は「修正」ボタンを押してください。
          </p>

          {error && <Alert type="danger" title="エラーが発生しました">{error.message}</Alert>}

          <FormSection>
            <FormItem>
              <FormButton color="default"
                onClick={() => props.prevStep()}
                disabled={isProgress}>
                修正する
              </FormButton>
            </FormItem>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress}>
                <FormButton
                  onClick={handleSubmit}
                  disabled={isProgress}>
                  決済に進む(申し込み情報送信)
                </FormButton>
              </LoadingCircleWrapper>
            </FormItem>
          </FormSection>
        </>
      }
    </>
  )
}

export default Step2
