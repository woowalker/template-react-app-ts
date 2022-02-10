import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type Props = {
  config: any
}

const AddBtn = (props: Props) => {
  const { LABEL, CSS } = props.config
  return <Button type={CSS || 'primary'} icon={<PlusOutlined />}>{LABEL}</Button>
}

export default AddBtn