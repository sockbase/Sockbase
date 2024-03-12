import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormButton from '../../components/Form/Button'
import FormCheckbox from '../../components/Form/Checkbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'

const DashboardEventCreatePage: React.FC = () => {
  return (
    <DashboardBaseLayout title="イベント作成" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="イベント作成"
        description="イベントを作成します"
        icon={<MdEditCalendar />} />

      <TwoColumnsLayout>
        <>
          <h2>イベント基礎情報</h2>
          <FormSection>
            <FormItem>
              <FormLabel>イベント名</FormLabel>
              <FormInput />
            </FormItem>
            <FormItem>
              <FormLabel>イベントWebサイト</FormLabel>
              <FormInput />
            </FormItem>
          </FormSection>

          <h2>組織情報</h2>
          <FormSection>
            <FormItem>
              <FormLabel>組織ID</FormLabel>
              <FormInput />
            </FormItem>
            <FormItem>
              <FormLabel>組織名</FormLabel>
              <FormInput />
            </FormItem>
            <FormItem>
              <FormLabel>連絡先</FormLabel>
              <FormInput />
            </FormItem>
          </FormSection>

          <h2>全体スケジュール</h2>
          <FormSection>
            <FormItem>
              <FormLabel>申し込み開始</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
            <FormItem>
              <FormLabel>申し込み終了</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
            <FormItem>
              <FormLabel>申し込み情報確定</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
            <FormItem>
              <FormLabel>配置発表</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
            <FormItem>
              <FormLabel>イベント開始</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
            <FormItem>
              <FormLabel>イベント終了</FormLabel>
              <FormInput type="datetime-local" />
            </FormItem>
          </FormSection>
        </>
        <>
          <h2>注意事項</h2>
          <FormSection>
            <FormItem>
              <FormLabel>注意事項 1</FormLabel>
              <FormInput />
            </FormItem>
          </FormSection>

          <h2>説明</h2>
          <FormSection>
            <FormItem>
              <FormLabel>説明 1</FormLabel>
              <FormInput />
            </FormItem>
          </FormSection>

          <h2>制限設定</h2>
          <FormCheckbox
            name="allowAdult"
            label="成人向け頒布を許可する"
            checked={true}
            onChange={() => console.log('a')}/>
        </>
      </TwoColumnsLayout>
      <FormSection>
        <FormItem>
          <FormButton inlined>内容確認</FormButton>
        </FormItem>
      </FormSection>
    </DashboardBaseLayout>
  )
}

export default DashboardEventCreatePage
