import { useContext } from 'react'
import { Button } from 'antd'
import { FormPage, EasyModal, ListContext } from 'src/components'

type Props = {
  config: any
}

const AddBtn = (props: Props) => {
  const list = useContext(ListContext)

  const handleModalClose = () => {
    list && list.reload()
  }

  const { LABEL, CSS, ICON, FORM_CODE } = props.config
  return (
    <EasyModal
      width='98%'
      slot={<Button type={CSS || 'primary'} icon={ICON}>{LABEL}</Button>}
      afterClose={handleModalClose}
    >
      <FormPage formCode={FORM_CODE} />
    </EasyModal>
  )
}

export default AddBtn