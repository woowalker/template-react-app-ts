import * as ListBtns from './buttons/list'
import * as EditBtns from './buttons/edit'
import { $consts } from 'src/plugins'

/**
 * 编辑表单配置的各种按钮
 * @param props 
 * @returns 
 */
const EditButton = (props: any) => {
  const { BTN_TYPE } = props.config
  const { SaveBtn, AddBtn } = EditBtns
  switch (BTN_TYPE) {
    // 保存按钮
    case $consts['TABLE/BTN_TYPE_SAVE']:
      return <SaveBtn config={props.config} />
    // 新增按钮
    case $consts['TABLE/BTN_TYPE_ADD']:
      return <AddBtn config={props.config} />
    default:
      return <div />
  }
}

/**
 * 列表表单配置的各种按钮
 * @param props 
 * @returns 
 */
const ListButton = (props: any) => {
  const { BTN_TYPE } = props.config
  const { CustomModalBtn, DeleteConfirmBtn, AddBtn } = ListBtns
  switch (BTN_TYPE) {
    // 自定义弹窗按钮
    case $consts['TABLE/BTN_TYPE_CUSTOM_MODAL']:
      return <CustomModalBtn config={props.config} />
    // 新增按钮
    case $consts['TABLE/BTN_TYPE_ADD']:
      return <AddBtn config={props.config} />
    // 删除按钮
    case $consts['TABLE/BTN_TYPE_DELETE']:
      return <DeleteConfirmBtn config={props.config} />
    // 编辑按钮
    case $consts['TABLE/BTN_TYPE_EDIT']:
      return <CustomModalBtn config={props.config} />
    default:
      return <div />
  }
}

type Props = {
  pageType: 0 | 1, // 0: ListPage 1: EditPage
  config: any
}
const LoadableButton = (props: Props) => {
  return props.pageType === $consts['TABLE/FORM_TYPE_EDIT_PAGE'] ? <EditButton config={props.config} /> : <ListButton config={props.config} />
}

export default LoadableButton