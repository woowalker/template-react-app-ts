import { useContext } from 'react'
import { Button, message } from 'antd'
import { EditContext, ModalContext, ListTableContext } from 'src/components'
import { commonStore } from 'src/stores'
import { $api } from 'src/plugins'

type Props = {
  config: any
}

const SaveBtn = (props: Props) => {
  const edit = useContext(EditContext)
  const table = useContext(ListTableContext)
  const modal = useContext(ModalContext)

  const handleSave = () => {
    // 表单校验
    const verify = edit?.verifyFormBase?.()
    if (verify && Object.entries(verify).map(([item, value]) => value).filter(item => !!item).length) return

    const { Nav_PageEdit } = edit.formState
    const { Nav_PageEdit: deepConfig } = Nav_PageEdit
    if (deepConfig.API_URL) {
      const { ORG_ID } = commonStore.userinfo
      $api['app/getDataByPost'](
        { ORG_ID, ...edit.formBase },
        { url: `/${deepConfig.API_URL}` }
      ).then((res: any) => {
        if (res) {
          message.success('操作成功')
          table && table.reload()
          modal && modal.close()
        }
      })
    } else {
      message.error('未配置对应接口，请检查配置')
    }
  }

  const { LABEL } = props.config
  return <Button type='primary' onClick={handleSave}>{LABEL}</Button>
}

export default SaveBtn