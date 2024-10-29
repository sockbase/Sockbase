import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdWallet } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormHelp from '../../components/Form/FormHelp'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import FormSelect from '../../components/Form/FormSelect'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import envHelper from '../../helpers/envHelper'
import useDayjs from '../../hooks/useDayjs'
import useFirebaseError from '../../hooks/useFirebaseError'
import useStore from '../../hooks/useStore'
import useValidate from '../../hooks/useValidate'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseStoreDocument, SockbaseTicketCreatedResult } from 'sockbase'

const TicketCreatePage: React.FC = () => {
  const { storeId } = useParams()
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

  const [isClearEmail, setIsClearEmail] = useState(false)

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string | null>()

  const errorCount = useMemo(() => {
    const validators = [
      validator.isEmail(createTicketData.email),
      !validator.isEmpty(createTicketData.typeId)
    ]
    return validators
      .filter(v => !v)
      .length
  }, [createTicketData])

  const getType = useCallback((typeId: string) => {
    return store?.types.find(t => t.id === typeId)
  }, [])

  const getAssignURL = useCallback((hashId: string) => {
    return hashId && `${envHelper.userAppURL}/assign-tickets?thi=${hashId}`
  }, [])

  const createTicket = useCallback(() => {
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
  }, [])

  useEffect(() => {
    if (!storeId) return
    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [storeId])

  return (
    <DefaultLayout title="チケット作成">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/stores/${store?.id}`}>{store?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdWallet />}
        title="チケット作成" />

      <TwoColumnLayout>
        <>
          <h2>チケット作成</h2>
          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput
                placeholder="sumire@sockbase.net"
                onChange={e => setCreateTicketData(s => ({ ...s, email: e.target.value }))}
                value={createTicketData.email} />
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

          {error && <Alert type="error" title="エラーが発生しました">{error}</Alert>}

          <FormSection>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress}>
                <FormButton onClick={createTicket} disabled={isProgress || errorCount > 0}>確認して登録</FormButton>
              </LoadingCircleWrapper>
            </FormItem>
            <FormItem>
              <FormCheckbox
                name="isClearEmail"
                label="追加後メールアドレスを空欄にする"
                checked={isClearEmail}
                onChange={c => setIsClearEmail(c)} />
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
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default TicketCreatePage
