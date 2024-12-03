import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type SockbaseInformationDocument } from 'sockbase'
import useDayjs from '../../hooks/useDayjs'
import useInformation from '../../hooks/useInformation'

const InformationList: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { getPublishedInformationsAsync } = useInformation()

  const [informations, setInformations] = useState<SockbaseInformationDocument[]>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      const informations = await getPublishedInformationsAsync()
      setInformations(informations)
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [getPublishedInformationsAsync])

  return (
    <>
      <h2>Sockbase からのお知らせ</h2>
      {!informations && <p>お知らせ情報を取得中...</p>}
      {informations
        ? informations.length > 0
          ? (
            <table>
              <tbody>
                {informations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map(i => (
                    <tr key={i.id}>
                      <td style={{ width: '30%' }}>{formatByDate(i.updatedAt, 'YYYY年 M月 D日')}</td>
                      <td><Link to={`/informations/${i.id}`}>{i.title}</Link></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )
          : <p>お知らせはありません</p>
        : <></>}
    </>
  )
}

export default InformationList
