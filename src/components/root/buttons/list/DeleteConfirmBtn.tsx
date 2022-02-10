import { useContext } from 'react'
import { Popconfirm, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { ListTableContext } from 'src/components'
import { $api } from 'src/plugins'

type Props = {
  config: any
}

const DeleteConfirmBtn = (props: Props) => {
  const table = useContext(ListTableContext)

  const handleDelete = () => {
    const record = table.selectedData[0]
    const { API_URL } = props.config
    if (!API_URL) {
      message.error('未配置删除API接口')
      return
    }
    $api['app/getDataByGet'](
      { id: record?.ID },
      { url: `/${API_URL}` }
    ).then((res: any) => {
      if (res) {
        table.reload()
        message.success('删除成功')
      }
    })
  }

  const { config } = props
  const { LABEL } = config
  return (
    <Popconfirm title='确认删除？' onConfirm={handleDelete}>
      <span className='color-error'><DeleteOutlined className='fz-16' /><span className='pd-l4'>{LABEL}</span></span>
    </Popconfirm>
  )
}

export default DeleteConfirmBtn