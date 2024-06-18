import { useMemo } from 'react'
import styled from 'styled-components'
import useRole from '../../hooks/useRole'
import HeadHelper from '../../libs/Helmet'
import RequiredLogin from '../../libs/RequiredLogin'
import type { SockbaseRole } from 'sockbase'

interface Props {
  children: React.ReactNode
  title: string
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
}
const DashboardPrintLayout: React.FC<Props> = (props) => {
  const { systemRole, commonRole } = useRole()

  const isValidRole = useMemo((): boolean => {
    if (systemRole === undefined && commonRole === undefined) return false

    if (!props.requireSystemRole && !props.requireCommonRole) {
      return true
    } else if (props.requireSystemRole) {
      return (systemRole ?? 0) >= props.requireSystemRole
    } else if (props.requireCommonRole) {
      return (commonRole ?? 0) >= props.requireCommonRole
    }

    return false
  }, [systemRole, props.requireSystemRole, props.requireCommonRole])

  return (
    <PrintContainer>
      <RequiredLogin />
      <HeadHelper title={props.title} />
      {isValidRole && props.children}
    </PrintContainer>
  )
}

export default DashboardPrintLayout

const PrintContainer = styled.div`
  @page {
    size: A4 landscape;
    margin: 5mm;
    padding: 0;
  }
`
