import { useState, useEffect } from 'react'
import { ListPage, CustomPage, EditPage } from 'src/components'
import { commonStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'

type CheckProps = {
  formCode: string,
  formState?: any
}

const CheckFormPage = (props: CheckProps) => {
  const { formState } = props
  if (formState) {
    const { FORM_TYPE, CODE } = formState
    switch (FORM_TYPE) {
      // 列表表单
      case $consts['TABLE/FORM_TYPE_LIST_PAGE']:
        return <ListPage formCode={CODE} />
      // 自定义表单
      case $consts['TABLE/FORM_TYPE_CUSTOM_PAGE']:
        return <CustomPage formCode={CODE} />
      // 编辑表单
      case $consts['TABLE/FORM_TYPE_EDIT_PAGE']:
        return <EditPage formCode={CODE} />
      default:
        return null
    }
  }

  return null
}

type Props = {
  formCode: string
}

const FormPage = (props: Props) => {
  const [formState, setFormState] = useState()

  useEffect(() => {
    const { ORG_ID: orgid } = commonStore.userinfo
    $api['app/getByRedis']({
      Key: props.formCode,
      orgid
    }).then((res: any) => {
      res && setFormState(res)
    })
  }, [props.formCode])

  return (
    <CheckFormPage
      formCode={props.formCode}
      formState={formState}
    />
  )
}

export default FormPage