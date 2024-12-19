import { useCallback, useState } from 'react'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import FormButton from '../../../../components/Form/FormButton'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../../components/Parts/LoadingCircleWrapper'
import ProgressBar from '../../../../components/Parts/ProgressBar'
import UserDataView from '../../../../components/UserDataView'
import useError from '../../../../hooks/useError'
import type {
  SockbaseEventDocument,
  SockbaseApplication,
  SockbaseApplicationLinks,
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseEventGenre,
  SockbaseEventSpace
} from 'sockbase'

interface Props {
  event: SockbaseEventDocument | undefined
  app: SockbaseApplication | undefined
  links: SockbaseApplicationLinks | undefined
  userData: SockbaseAccountSecure | undefined
  fetchedUserData: SockbaseAccount | null | undefined
  selectedGenre: SockbaseEventGenre | undefined
  selectedSpace: SockbaseEventSpace | undefined
  selectedPaymentMethod: { id: string, description: string } | undefined
  submitProgressPercent: number
  submitAsync: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Confirm: React.FC<Props> = props => {
  const { convertErrorMessage } = useError()

  const [isProgress, setProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleSubmit = useCallback(() => {
    setProgress(true)
    setErrorMessage(null)
    props.submitAsync()
      .then(() => props.nextStep())
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        setProgress(false)
        throw err
      })
  }, [])

  return (
    <>
      <h1>入力内容の確認</h1>

      <h2>サークル情報</h2>
      <table>
        <tbody>
          <tr>
            <th>サークル名</th>
            <td>{props.app?.circle.name}</td>
          </tr>
          <tr>
            <th>サークル名 (よみ)</th>
            <td>{props.app?.circle.yomi}</td>
          </tr>
          <tr>
            <th>ペンネーム</th>
            <td>{props.app?.circle.penName}</td>
          </tr>
          <tr>
            <th>ペンネーム (よみ)</th>
            <td>{props.app?.circle.penNameYomi}</td>
          </tr>
        </tbody>
      </table>

      <h2>頒布物情報</h2>
      <table>
        <tbody>
          {props.event?.permissions.allowAdult && (
            <tr>
              <th>成人向け頒布物の有無</th>
              <td>
                {props.app?.circle.hasAdult
                  ? '成人向け頒布物があります'
                  : '成人向け頒布物はありません'}
              </td>
            </tr>
          )}
          <tr>
            <th>配置希望ジャンル</th>
            <td>{props.selectedGenre?.name}</td>
          </tr>
          <tr>
            <th>頒布物概要</th>
            <td>{props.app?.overview.description}</td>
          </tr>
          <tr>
            <th>総搬入量</th>
            <td>{props.app?.overview.totalAmount}</td>
          </tr>
        </tbody>
      </table>

      <h2>隣接配置希望(合体)情報</h2>
      <table>
        <tbody>
          <tr>
            <th>合体希望サークル 合体申し込み ID</th>
            <td>{props.app?.unionCircleId || '(空欄)'}</td>
          </tr>
          <tr>
            <th>プチオンリーコード</th>
            <td>{props.app?.petitCode || '(空欄)'}</td>
          </tr>
        </tbody>
      </table>

      <h2>サークル広報情報</h2>
      <table>
        <tbody>
          <tr>
            <th>X (Twitter)</th>
            <td>{(props.links?.twitterScreenName && `@${props.links?.twitterScreenName}`) || '(空欄)'}</td>
          </tr>
          <tr>
            <th>pixiv</th>
            <td>{(props.links?.pixivUserId && `users/${props.links?.pixivUserId}`) || '(空欄)'}</td>
          </tr>
          <tr>
            <th>Web サイト</th>
            <td>{props.links?.websiteURL || '(空欄)'}</td>
          </tr>
          <tr>
            <th>お品書き URL</th>
            <td>{props.links?.menuURL || '(空欄)'}</td>
          </tr>
        </tbody>
      </table>

      <UserDataView
        fetchedUserData={props.fetchedUserData}
        userData={props.userData} />

      <h2>通信欄</h2>
      <p>
        {props.app?.remarks || '(空欄)'}
      </p>

      <h2>サークル参加費</h2>
      <h3>選択されたスペース</h3>
      <table>
        <tbody>
          <tr>
            <th>スペース</th>
            <td>{props.selectedSpace?.name}</td>
          </tr>
          <tr>
            <th>詳細</th>
            <td>{props.selectedSpace?.description}</td>
          </tr>
          <tr>
            <th>参加費</th>
            <td>{props.selectedSpace?.price.toLocaleString()}円</td>
          </tr>
        </tbody>
      </table>

      <h3>決済方法</h3>
      <p>
        {props.selectedPaymentMethod?.description}
      </p>

      <h1>申し込み情報送信</h1>
      <p>
        上記の内容で正しければ「決済に進む (申し込み情報送信)」ボタンを押してください。
      </p>
      <p>
        修正する場合は「修正」ボタンを押してください。
      </p>

      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">
          {errorMessage}
        </Alert>
      )}

      <FormSection>
        <FormItem>
          <FormButton
            disabled={isProgress}
            onClick={() => props.prevStep()}>
            <IconLabel
              icon={<MdArrowBack />}
              label="修正する" />
          </FormButton>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <LoadingCircleWrapper
            inlined
            isLoading={isProgress}>
            <FormButton
              color="primary"
              disabled={isProgress}
              onClick={handleSubmit}>
              <IconLabel
                icon={<MdArrowForward />}
                label="決済に進む (申し込み情報送信)" />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {isProgress && (
        <>
          <ProgressBar percent={props.submitProgressPercent} />
          <Alert
            title="申し込み情報を送信中です"
            type="info">
            送信処理に時間がかかる場合がございます。<br />
            進捗率が 100% になるまでそのままでお待ちください。
          </Alert>
        </>
      )}
    </>
  )
}

export default Confirm
