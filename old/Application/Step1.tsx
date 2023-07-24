import { useState, useEffect } from 'react'

import type { SockbaseStoreType, SockbaseStore, SockbaseTicketApplication, SockbaseAccountSecure } from 'sockbase'
import sockbaseShared from 'shared'

import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import FormTextarea from '../../../Form/Textarea'
import FormLabel from '../../../Form/Label'
import FormRadio from '../../../Form/Radio'
import FormInput from '../../../Form/Input'
import Alert from '../../../Parts/Alert'
import FormCheckbox from '../../../Form/Checkbox'

import usePostalCode from '../../../../hooks/usePostalCode'

interface Props {
  prevStep: () => void
  nextStep: (app: SockbaseTicketApplication, userData: SockbaseAccountSecure) => void
  storeId: string
  store: SockbaseStore
  app: SockbaseTicketApplication | undefined
  userData: SockbaseAccountSecure | undefined
}
const Step1: React.FC<Props> = (props) => {
  const { getAddressByPostalCode } = usePostalCode()

  const [app, setApp] = useState<SockbaseTicketApplication>({
    storeId: props.storeId,
    typeId: '',
    paymentMethod: '',
    remarks: ''
  })
  const [leaderUserData, setLeaderUserData] = useState({
    name: '',
    birthday: 0,
    postalCode: '',
    address: '',
    telephone: '',
    email: '',
    password: '',
    rePassword: ''
  })
  const [displayBirthday, setDisplayBirthday] = useState('1990-01-01')

  const [selectedType, setSelectedType] = useState<SockbaseStoreType>()
  const [isAgreed, setAgreed] = useState(false)

  const onInitialize: () => void =
    () => {
      if (!props.app || !props.userData) return
      setApp(props.app)
      setLeaderUserData(props.userData)
    }
  useEffect(onInitialize, [props.app, props.userData])

  const onChangeBirthday: () => void =
    () => setLeaderUserData(s => ({ ...s, birthday: new Date(displayBirthday).getTime() }))
  useEffect(onChangeBirthday, [displayBirthday])

  const onChangeType: () => void =
    () => setSelectedType(props.store.types.filter(t => t.id === app.typeId)[0])
  useEffect(onChangeType, [app])

  const handleFilledPostalCode: (postalCode: string) => void =
    (postalCode) => {
      const sanitizedPostalCode = postalCode.replaceAll('-', '')

      if (sanitizedPostalCode.length !== 7) return
      getAddressByPostalCode(sanitizedPostalCode)
        .then(address => setLeaderUserData(s => ({
          ...s,
          address
        })))
        .catch(err => {
          throw err
        })
    }

  const handleSubmit: () => void =
    () => {
      props.nextStep(app, leaderUserData)
    }

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={props.prevStep}>申し込み説明画面へ戻る</FormButton>
        </FormItem>
      </FormSection>

      <h2>申し込み種別</h2>
      <FormSection>
        <FormItem>
          <FormLabel>申し込み種別</FormLabel>
          <FormRadio
            name="types"
            values={
              props.store.types.map(t => ({
                text: `${t.name} ${t.price.toLocaleString()}円 / ${t.description}`,
                value: t.id
              }))
            }
            onChange={(typeId) => setApp(s => ({ ...s, typeId }))}
            value={app.typeId} />
        </FormItem>
      </FormSection>

      <h2>参加者情報</h2>
      <p>
        参加者の方の情報をご入力ください。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>氏名</FormLabel>
          <FormInput
            onChange={(e) => setLeaderUserData(s => ({ ...s, name: e.target.value }))}
            value={leaderUserData.name} />
        </FormItem>
        <FormItem>
          <FormLabel>生年月日</FormLabel>
          <FormInput type="date"
            onChange={(e) => setDisplayBirthday(e.target.value)}
            value={displayBirthday} />
        </FormItem>
        <FormItem>
          <FormLabel>郵便番号</FormLabel>
          <FormInput
            value={leaderUserData.postalCode}
            onChange={e => {
              if (e.target.value.length > 8) return
              const postal = e.target.value.match(/(\d{3})(\d{4})/)
              handleFilledPostalCode(e.target.value)
              setLeaderUserData(s => ({
                ...s,
                postalCode:
                  postal?.length === 3
                    ? `${postal[1]}-${postal[2]}`
                    : e.target.value
              }))
            }} />
        </FormItem>
        <FormItem>
          <FormLabel>住所</FormLabel>
          <FormInput
            onChange={(e) => setLeaderUserData(s => ({ ...s, address: e.target.value }))}
            value={leaderUserData.address} />
        </FormItem>
        <FormItem>
          <FormLabel>電話番号</FormLabel>
          <FormInput
            onChange={(e) => setLeaderUserData(s => ({ ...s, telephone: e.target.value }))}
            value={leaderUserData.telephone} />
        </FormItem>
      </FormSection>

      <h2>Sockbaseログイン情報</h2>
      <p>
        申し込み情報の確認等に使用するアカウントを作成します。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput type="email"
            onChange={(e) => setLeaderUserData(s => ({ ...s, email: e.target.value }))}
            value={leaderUserData.email} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput type="password"
            onChange={(e) => setLeaderUserData(s => ({ ...s, password: e.target.value }))}
            value={leaderUserData.password} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード(確認)</FormLabel>
          <FormInput type="password"
            onChange={(e) => setLeaderUserData(s => ({ ...s, rePassword: e.target.value }))}
            value={leaderUserData.rePassword} />
        </FormItem>
      </FormSection>

      <h2>参加費お支払い方法</h2>
      {selectedType
        ? <FormSection>
          <FormItem>
            <table>
              <tbody>
                <tr>
                  <th>種類</th>
                  <td>{selectedType.name}</td>
                </tr>
                <tr>
                  <th>詳細</th>
                  <td>{selectedType.description}</td>
                </tr>
                <tr>
                  <th>お支払額</th>
                  <td>{selectedType.price.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </FormItem>
          <FormItem>
            <FormRadio
              name="paymentMethod"
              values={
                sockbaseShared.constants.payment.methods
                  .map(m => ({ value: m.id, text: m.description }))
              }
              onChange={(methodId) => setApp(s => ({ ...s, paymentMethod: methodId }))}
              value={app.paymentMethod} />
          </FormItem>
          {app.paymentMethod === 'bankTransfer' && <FormItem>
            <Alert>
              銀行振込の場合、申し込み完了までお時間をいただくことがございます。
            </Alert>
          </FormItem>}
        </FormSection>
        : <p>申し込みたいチケット種別を選択してください</p>}

      <h2>通信欄</h2>
      <p>
        申し込みにあたり運営チームへの要望等がありましたらご入力ください。
      </p>
      <FormSection>
        <FormItem>
          <FormTextarea
            onChange={(e) => setApp(s => ({ ...s, remarks: e.target.value }))}
            value={app.remarks}>
          </FormTextarea>
        </FormItem>
      </FormSection>

      <h2>注意事項</h2>
      <p>
        Sockbase利用規約およびプライバシーポリシーに同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAgreed"
            label="同意します"
            onChange={(checked) => setAgreed(checked)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton onClick={handleSubmit}>入力内容確認画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step1
