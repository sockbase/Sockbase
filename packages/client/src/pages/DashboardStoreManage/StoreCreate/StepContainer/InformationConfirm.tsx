import { useCallback, useState } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import useDayjs from '../../../../hooks/useDayjs'
import type { SockbaseStore } from 'sockbase'

interface Props {
  storeId: string | null | undefined
  store: SockbaseStore | null | undefined
  prevStep: () => void
  nextStep: () => void
  handleCreateAsync: () => Promise<void>
}
const InformationConfirm: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [isProcess, setProcess] = useState(false)

  const handleCreate = useCallback(() => {
    setProcess(true)
    props.handleCreateAsync()
      .then(() => props.nextStep())
      .catch(err => {
        console.error(err)
        setProcess(false)
      })
  }, [props.handleCreateAsync])

  return (
    <>
      <h2>STEP2: 入力内容の確認</h2>

      <h3>チケットストア基礎情報</h3>
      <table>
        <tbody>
          <tr>
            <th>チケットストアID</th>
            <td>{props.storeId}</td>
          </tr>
          <tr>
            <th>チケットストア名</th>
            <td>{props.store?.storeName}</td>
          </tr>
          <tr>
            <th>イベントWebサイト</th>
            <td>{props.store?.storeWebURL}</td>
          </tr>
        </tbody>
      </table>

      <h3>組織情報</h3>
      <table>
        <tbody>
          <tr>
            <th>組織ID</th>
            <td>{props.store?._organization.id}</td>
          </tr>
          <tr>
            <th>組織名</th>
            <td>{props.store?._organization.name}</td>
          </tr>
          <tr>
            <th>連絡先URL</th>
            <td>{props.store?._organization.contactUrl}</td>
          </tr>
        </tbody>
      </table>

      <h3>全体スケジュール</h3>
      <table>
        <tbody>
          <tr>
            <th>申し込み受付開始</th>
            <td>{formatByDate(props.store?.schedules.startApplication, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>申し込み受付終了</th>
            <td>{formatByDate((props.store?.schedules.endApplication ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント開始</th>
            <td>{formatByDate(props.store?.schedules.startEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント終了</th>
            <td>{formatByDate(props.store?.schedules.endEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
        </tbody>
      </table>

      <h3>チケットタイプ</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>タイプID</th>
            <th style={{ width: '15%' }}>タイプ名</th>
            <th style={{ width: '20%' }}>説明</th>
            <th style={{ width: '10%' }}>価格</th>
            <th style={{ width: '10%' }}>支払いURL</th>
            <th style={{ width: '10%' }}>商品ID</th>
            <th>チケットカラー</th>
            <th>非公開</th>
          </tr>
        </thead>
        <tbody>
          {props.store?.types.length
            ? props.store.types.map((t, i) => <tr key={i}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.description}</td>
              <td>{t.price.toLocaleString()}円</td>
              <td>{t.productInfo?.paymentURL}</td>
              <td>{t.productInfo?.productId}</td>
              <td>{t.color}</td>
              <td>{t.private ? '非公開' : '公開'}</td>
            </tr>)
            : <tr>
              <td colSpan={8}>チケットタイプ情報が入力されていません</td>
            </tr>}
        </tbody>
      </table>

      <h3>各種事項</h3>
      <table>
        <tbody>
          <tr>
            <th>注意事項</th>
            <td>
              <ul>
                {props.store?.rules.length
                  ? props.store?.rules.map((r, i) => <li key={i}>{r}</li>)
                  : <li>注意事項が入力されていません</li>}
              </ul>
            </td>
          </tr>
          <tr>
            <th>申し込み説明</th>
            <td>
              <ul>
                {props.store?.descriptions.length
                  ? props.store?.descriptions.map((d, i) => <li key={i}>{d}</li>)
                  : <li>申し込み説明が入力されていません</li>}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <FormSection>
        <FormItem inlined>
          <FormButton onClick={handleCreate} disabled={isProcess} inlined>作成する</FormButton>
          <FormButton onClick={props.prevStep} color="default" disabled={isProcess} inlined>修正する</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default InformationConfirm
