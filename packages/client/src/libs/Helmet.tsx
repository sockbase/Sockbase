import { Helmet } from 'react-helmet-async'

interface Props {
  title?: string
}

const HeadHelper: React.FC<Props> = (props) => {
  const title = props.title ? `${props.title} - Sockbase` : 'Sockbase'
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  )
}

export default HeadHelper
