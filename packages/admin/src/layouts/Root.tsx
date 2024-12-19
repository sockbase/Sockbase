import { Helmet } from 'react-helmet-async'

interface Props {
  title?: string
  children: React.ReactNode
}
const Root: React.FC<Props> = props => {
  const title = props.title ? `${props.title} - Sockbase ADMIN` : 'Sockbase ADMIN'

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {props.children}
    </>
  )
}

export default Root
