import { useContext } from 'react'
import { EasyModal, ListTableContext, FormPage, EnergyIcon } from 'src/components'

type Props = {
  config: any
}

const CustomModalBtn = (props: Props) => {
  const table = useContext(ListTableContext)
  const record = table.selectedData[0]
  const { ICON, LABEL, FORM_CODE } = props.config

  return (
    <EasyModal
      width='98%'
      title={record?.NAME || record?.ALIAS || record?.ID || FORM_CODE}
      slot={<span><EnergyIcon type={ICON} /><span className='pd-l4'>{LABEL}</span></span>}
    >
      <FormPage formCode={FORM_CODE} />
    </EasyModal>
  )
}

export default CustomModalBtn