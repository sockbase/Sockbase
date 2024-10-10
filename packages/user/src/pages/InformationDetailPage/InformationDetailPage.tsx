import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Alert from '../../components/Parts/Alert'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useDayjs from '../../hooks/useDayjs'
import useInformation from '../../hooks/useInformation'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import type { SockbaseInformationDocument } from 'sockbase'

const InformationDetailPage: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { informationId } = useParams<{ informationId: string }>()
  const { getInformationByIdNullableAsync } = useInformation()

  const [information, setInformation] = useState<SockbaseInformationDocument | null>()

  const informationBody = useMemo(() => {
    if (!information) return
    const body = information.body.replaceAll('\\n', '\n')
    return body
  }, [information])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!informationId) return
      const information = await getInformationByIdNullableAsync(informationId)
      setInformation(information)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [informationId, getInformationByIdNullableAsync])

  return (
    <DefaultBaseLayout title={information ? information.title : 'お知らせ'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      {information === undefined && <Alert type="info" title="お知らせを取得中">
        お知らせを取得しています。しばらくお待ちください。
      </Alert>}

      {information === null && <Alert type="error" title="お知らせが見つかりませんでした">
        URL をお確かめの上、再度お試しください。
      </Alert>}

      {information && informationBody && <>
        <InformationTitle>{information.title}</InformationTitle>
        <InformationDate>
          {formatByDate(information.updatedAt, 'YYYY年 M月 D日')} 更新
        </InformationDate>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {informationBody}
        </ReactMarkdown>
      </>}
    </DefaultBaseLayout>
  )
}

export default InformationDetailPage

const InformationTitle = styled.h1`
  margin-bottom: 0;
`
const InformationDate = styled.p``
