interface Props {
  children: React.ReactNode
}
const DefaultLayout: React.FC<Props> = (props) => {
  return (
    <>
      {props.children}
    </>
  )
}

export default DefaultLayout
