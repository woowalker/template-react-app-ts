import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react'
import { Form, Row, Col } from 'antd'
import { ListTableContext, LoadableButton, LoadableControl } from 'src/components'
import { EditPageSubTable } from './components'
import { commonStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { initFilter, getSingleRule, extendRules, extendInclude } from 'src/utils/common'
import { verifyField, getNavFields } from 'src/components/root/helper'
import 'src/styles/components/root/editPage.less'

type EditProps = {
  formCode: string,
  formState: any,
  record?: any
}

const EditContext = React.createContext<any>(undefined)
const EditMain = (props: EditProps) => {
  // 表单数据
  const [formBase, setFormBase] = useState({})

  // 表单校验
  const [verify, setVerify] = useState({})
  // 表单校验白名单
  const [verifyWhiteList, setVerifyWhiteList] = useState<string[]>([])
  const verifyFormBase = useCallback(() => {
    const { Nav_PageEdit } = props.formState
    const { Nav_Columns = [] } = Nav_PageEdit
    const verify: any = {}
    Nav_Columns.forEach((item: any) => {
      if (verifyWhiteList.includes(item.FIELD_NAME)) return

      verify[item.FIELD_NAME] = verifyField(item, formBase)
    })
    setVerify(verify)
    return verify
  }, [props.formState, formBase])

  // 编辑表单详情
  const table = useContext(ListTableContext)
  const record = useMemo(() => {
    return table?.selectedData[0] || props.record
  }, [table, props.record])
  useEffect(() => {
    const { Nav_PageEdit, Nav_SubPageEdits = [] } = props.formState
    const { Nav_PageEdit: deepConfig } = Nav_PageEdit
    if (record?.ID && deepConfig?.QUERY_API_URL) {
      const { ORG_ID: OrgId } = commonStore.userinfo
      const payload = initFilter({ OrgId })
      const singleRule = getSingleRule('ID', 1, record.ID)
      extendRules(payload.FilterGroup, singleRule)
      // 获取导航属性
      const navFields = getNavFields(Nav_SubPageEdits)
      navFields.length && extendInclude(payload, navFields)

      $api['app/getDataByPost'](
        payload,
        { url: deepConfig.QUERY_API_URL }
      ).then((res: any) => {
        res && setFormBase(res)
      })
    }
  }, [record, props.formState])

  // 配置的头部按钮
  const headerBtns = useMemo(() => {
    const { Nav_PageEdit } = props.formState
    const { Nav_Btns = [] } = Nav_PageEdit
    if (!Nav_Btns.length) return null
    return (
      <div className='edit-page__header'>
        {Nav_Btns.map((btn: any) => <LoadableButton key={btn.ID} pageType={$consts['TABLE/FORM_TYPE_EDIT_PAGE']} config={btn} />)}
      </div>
    )
  }, [props.formState])

  // 配置的动态加载的 js（表单配置了需要动态加载的 js 文件名，控件配置 js 文件中要执行的方法名）
  const dynamicJs = useMemo(() => {
    const { Nav_Form } = props.formState
    const { JS_FILES } = Nav_Form
    const funcs = $consts[`DYNAMICJS/${JS_FILES}`]
    return funcs || {}
  }, [props.formState])

  // 配置字段对应的 Form.Item 项，根据对应配置的组件渲染
  const formItems = useMemo(() => {
    const { Nav_PageEdit } = props.formState
    const { Nav_Columns = [] } = Nav_PageEdit
    return Nav_Columns.map((item: any) => {
      return (
        <Col key={item.ID} span={6}>
          <LoadableControl config={item} />
        </Col>
      )
    })
  }, [props.formState])

  // context 向下传递
  const contextValue = useMemo(() => {
    return {
      // 编辑表单字段基础信息
      formBase,
      setFormBase,
      // 编辑表单字段检验信息
      verify,
      verifyFormBase,
      // 编辑表单字段检验白名单
      verifyWhiteList,
      setVerifyWhiteList,
      // 编辑表单配置
      formState: props.formState,
      // 表单动态加载 js
      dynamicJs
    }
  }, [props.formState, formBase, verify, verifyWhiteList])

  const { Nav_SubPageEdits = [] } = props.formState
  return (
    <EditContext.Provider value={contextValue}>
      <div className='edit-page'>
        {headerBtns}
        <Form
          layout='horizontal'
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>{formItems}</Row>
        </Form>
        <EditPageSubTable configs={Nav_SubPageEdits} />
      </div>
    </EditContext.Provider>
  )
}

type Props = {
  formCode: string,
  record?: any
}
const EditPage = (props: Props) => {
  const [formState, setFormState] = useState()

  // 编辑表单配置
  useEffect(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const payload = initFilter({ OrgId, Keyword: props.formCode })
    $api['edit/getEditPageConfigInfo'](payload).then((res: any) => {
      res && setFormState(res)
    })
  }, [props.formCode])


  if (!formState) return null

  return <EditMain formCode={props.formCode} formState={formState} record={props.record} />
}

export { EditContext }
export default EditPage