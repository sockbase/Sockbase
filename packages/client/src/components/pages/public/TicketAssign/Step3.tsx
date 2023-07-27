// interface Props {
// }

import FormItem from "../../../Form/FormItem"
import FormSection from "../../../Form/FormSection"
import LinkButton from "../../../Parts/LinkButton"

// const Step3: React.FC<Props> = () => {
const Step3: React.FC = () => {
  return (
    <>
      <h1>チケットを受け取りました</h1>
      <p>
        チケットを受け取りました。
      </p>

      <h2>使用方法</h2>
      <p>
        マイページの「マイチケット」より受け取ったチケットを使用することができます。
      </p>
      <p>
        表示されたQRコードを入口スタッフまでご提示ください。
      </p>
      <p>
        提示できない場合、表示されたQRコードを印刷し、ご持参ください。
      </p>

      <h2>関連リンク</h2>
      <FormSection>
        <FormItem>
          <LinkButton to={`/dashboard/mytickets/`}>チケット画面を開く</LinkButton>
        </FormItem>
        <FormItem>
          <LinkButton to={`/dashboard/mytickets/`} color="default">チケット情報を確認する</LinkButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step3
