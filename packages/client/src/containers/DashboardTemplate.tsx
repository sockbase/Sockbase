import DashboardLayout from '../components/Layout/Dashboard/Dashboard'
import FormTemplateComponent from '../components/pages/FormTemplate/FormTemplate'

const FormTemplate: React.FC = () => {
  return (
    <DashboardLayout title="ダッシュボード">
      <FormTemplateComponent />
    </DashboardLayout>
  )
}

export default FormTemplate
