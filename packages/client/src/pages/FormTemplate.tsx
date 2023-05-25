import DefaultLayout from '../components/Layout/Default/Default'
import FormTemplateComponent from '../components/pages/FormTemplate/FormTemplate'

const FormTemplate: React.FC = () => {
  return (
    <DefaultLayout title="フォームテンプレート">
      <FormTemplateComponent />
    </DefaultLayout>
  )
}

export default FormTemplate
