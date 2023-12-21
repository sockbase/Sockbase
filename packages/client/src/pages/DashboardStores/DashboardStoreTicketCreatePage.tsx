import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseTicketCreatedResult, type SockbaseStoreDocument, type SockbaseStoreType } from 'sockbase'
import { MdStore } from 'react-icons/md'
import useStore from '../../hooks/useStore'
import useDayjs from '../../hooks/useDayjs'
import useValidate from '../../hooks/useValidate'
import useFirebaseError from '../../hooks/useFirebaseError'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import BlinkField from '../../components/Parts/BlinkField'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import Alert from '../../components/Parts/Alert'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import FormSelect from '../../components/Form/Select'
import FormButton from '../../components/Form/Button'
import FormHelp from '../../components/Form/Help'
import FormCheckbox from '../../components/Form/Checkbox'

const DashboardStoreTicketCreatePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()

  const { getStoreByIdAsync, createTicketForAdminAsync } = useStore()
  const validator = useValidate()
  const { formatByDate } = useDayjs()
  const { localize } = useFirebaseError()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [createdTickets, setCreatedTickets] = useState<SockbaseTicketCreatedResult[]>([])
  const [createTicketData, setCreateTicketData] = useState({
    email: '',
    typeId: ''
  })
  const [isClearEmail, setClearEmail] = useState(false)

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string | null>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return

      getStoreByIdAsync(storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [storeId])

  const createTicket = (): void => {
    if (!storeId || !createTicketData.email || !createTicketData.typeId) return

    const typeName = getType(createTicketData.typeId)?.name
    if (!confirm(`以下のチケットを作成します\n\nメールアドレス: ${createTicketData.email}\nチケット種別: ${typeName}\n\nよろしいですか？`)) return

    setProgress(true)
    setError(null)

    createTicketForAdminAsync(storeId, createTicketData)
      .then(ticket => {
        alert('追加しました')
        setCreatedTickets(s => ([...s, ticket]))

        if (!isClearEmail) return
        setCreateTicketData(s => ({
          ...s,
          email: ''
        }))
      })
      .catch((err: Error) => {
        setError(localize(err.message))
        throw err
      })
      .finally(() => setProgress(false))
  }

  const pageTitle = useMemo(() => {
    if (!store) return ''
    return `${store.storeName} チケット作成`
  }, [store])

  const errorCount = useMemo(() => {
    const validators = [
      validator.isEmail(createTicketData.email),
      !validator.isEmpty(createTicketData.typeId)
    ]
    return validators
      .filter(v => !v)
      .length
  }, [createTicketData])

  const getAssignURL = (hashId: string): string =>
    hashId && `${location.protocol}//${location.host}/assign-tickets?thi=${hashId}`

  const getType = (typeId: string): SockbaseStoreType | undefined => {
    if (!store) return
    return store.types
      .filter(t => t.id === typeId)[0]
  }

  return (
    <DashboardBaseLayout title={pageTitle} requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/stores">管理チケットストア</Link></li>
        <li><Link to={`/dashboard/stores/${storeId}`}>{store?.storeName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>
      <PageTitle title={store?.storeName} icon={<MdStore />} description={'チケット作成'} isLoading={!store} />

      <TwoColumnsLayout>
        <>
          <h2>チケット作成</h2>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput
                placeholder="sumire@sockbase.net"
                onChange={e => setCreateTicketData(s => ({ ...s, email: e.target.value }))}
                value={createTicketData.email}
                hasError={!!createTicketData.email && !validator.isEmail(createTicketData.email)} />
              <FormHelp>ユーザが存在する必要があります</FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>発行するチケット種別</FormLabel>
              <FormSelect
                onChange={e => setCreateTicketData(s => ({ ...s, typeId: e.target.value }))}
                value={createTicketData.typeId}>
                <option value="">チケット種別を選択してください</option>
                {store?.types
                  .filter(t => !t.productInfo)
                  .map((t, i) => <option key={t.id} value={t.id}>
                    {i + 1}: {t.name}
                  </option>)}
              </FormSelect>
              <FormHelp>
                決済が必要ないチケット種別のみ発行できます
              </FormHelp>
            </FormItem>
          </FormSection>

          {error && <Alert title="エラーが発生しました" type="danger">
            {error}
          </Alert>}

          <FormSection>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress} inlined>
                <FormButton onClick={createTicket} inlined disabled={isProgress || errorCount > 0}>確認して登録</FormButton>
              </LoadingCircleWrapper>
            </FormItem>
            <FormItem>
              <FormCheckbox
                name="isClearEmail"
                label="追加後メールアドレスを空欄にする"
                checked={isClearEmail}
                onChange={c => setClearEmail(c)}
                inlined />
            </FormItem>
          </FormSection>
        </>
        <>
          <h2>今回作成したチケット</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>種別</th>
                <th>メールアドレス</th>
                <th>作成時刻</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {createdTickets.length !== 0
                ? createdTickets
                  .sort((a, b) => (b.createdAt ?? 9) - (a.createdAt ?? 0))
                  .map((t, i) => <tr key={t.id}>
                    <td>{createdTickets.length - i}</td>
                    <td>
                      <a href={`/dashboard/tickets/${t.hashId}`} target="_blank" rel="noreferrer">
                        {getType(t.typeId)?.name}
                      </a>
                    </td>
                    <td>{t.email}</td>
                    <td>{formatByDate(t.createdAt, 'H時mm分ss秒')}</td>
                    <td><CopyToClipboard content={(t.hashId && getAssignURL(t.hashId)) ?? ''} /></td>
                  </tr>)
                : <tr>
                  <td colSpan={5}>今回作成したチケットはありません</td>
                </tr>}
            </tbody>
          </table>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardStoreTicketCreatePage
