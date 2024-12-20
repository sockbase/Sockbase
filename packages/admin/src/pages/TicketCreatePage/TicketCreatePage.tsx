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
  const [createTicketData, setCreateTicketData] = useState<{ email: string | null, typeId: string }>({
    email: '',
    typeId: ''
  })
  const [isStandalone, setIsStandalone] = useState(false)

  const [isClearEmail, setIsClearEmail] = useState(false)

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string | null>()

  const errorCount = useMemo(() => {
    const validators = [
      (isStandalone && !createTicketData.email) || (createTicketData.email && validator.isEmail(createTicketData.email)),
      validator.isNotEmpty(createTicketData.typeId)
    ]
    return validators
      .filter(v => !v)
      .length
  }, [createTicketData, isStandalone])

  const getType = useCallback((typeId: string) => {
    return store?.types.find(t => t.id === typeId)
  }, [store])

  const getAssignURL = useCallback((hashId: string) => {
    return hashId && `${envHelper.userAppURL}/assign-tickets?thi=${hashId}`
  }, [envHelper.userAppURL])

  const createTicket = useCallback(() => {
    if (!storeId || !createTicketData.typeId) return

    const typeName = getType(createTicketData.typeId)?.name
    if (!confirm(`以下のチケットを作成します\n\nメールアドレス: ${createTicketData.email || 'スタンドアロン'}\nチケット種別: ${typeName}\n\nよろしいですか？`)) return

    setProgress(true)
    setError(null)

    const sanitizedTicketData = {
      ...createTicketData,
      email: isStandalone ? null : createTicketData.email
    }

    createTicketForAdminAsync(storeId, sanitizedTicketData)
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
  }, [storeId, createTicketData, isClearEmail, isStandalone])

  useEffect(() => {
    if (!storeId) return
    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [storeId])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title="チケット作成">
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
              <FormLabel>発行するチケット種別</FormLabel>
              <FormSelect
                onChange={e => setCreateTicketData(s => ({ ...s, typeId: e.target.value }))}
                value={createTicketData.typeId}>
                <option value="">チケット種別を選択してください</option>
                {store?.types
                  .filter(t => !t.productInfo)
                  .map((t, i) => (
                    <option
                      key={t.id}
                      value={t.id}>
                      {i + 1}: {t.name}
                    </option>
                  ))}
              </FormSelect>
              <FormHelp>
                決済が必要ないチケット種別のみ発行できます
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormCheckbox
                checked={isStandalone}
                label="スタンドアロンチケットとして発券する"
                name="isStandalone"
                onChange={setIsStandalone} />
            </FormItem>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput
                disabled={isStandalone}
                onChange={e => setCreateTicketData(s => ({ ...s, email: e.target.value }))}
                placeholder="sumire@sockbase.net"
                value={createTicketData.email ?? ''} />
              <FormHelp>ユーザが存在する必要があります</FormHelp>
            </FormItem>
          </FormSection>

          {error && (
            <Alert
              title="エラーが発生しました"
              type="error">{error}
            </Alert>
          )}

          <FormSection>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress}>
                <FormButton
                  disabled={isProgress || errorCount > 0}
                  onClick={createTicket}>確認して登録
                </FormButton>
              </LoadingCircleWrapper>
            </FormItem>
            <FormItem>
              <FormCheckbox
                checked={isClearEmail}
                label="追加後メールアドレスを空欄にする"
                name="isClearEmail"
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
                <th />
              </tr>
            </thead>
            <tbody>
              {createdTickets.length !== 0
                ? createdTickets
                  .sort((a, b) => (b.createdAt ?? 9) - (a.createdAt ?? 0))
                  .map((t, i) => (
                    <tr key={t.id}>
                      <td>{createdTickets.length - i}</td>
                      <td>
                        <a
                          href={`/tickets/${t.hashId}`}
                          rel="noreferrer"
                          target="_blank">
                          {getType(t.typeId)?.name}
                        </a>
                      </td>
                      <td>{t.email || 'スタンドアロン'}</td>
                      <td>{formatByDate(t.createdAt, 'H時mm分ss秒')}</td>
                      <td><CopyToClipboard content={(t.hashId && getAssignURL(t.hashId)) ?? ''} /></td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={5}>今回作成したチケットはありません</td>
                  </tr>
                )}
            </tbody>
          </table>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default TicketCreatePage
