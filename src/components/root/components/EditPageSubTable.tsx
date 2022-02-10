import { useMemo, useContext } from 'react'
import { Table, Popover } from 'antd'
import { EditContext, LoadableButton } from 'src/components'
import { $consts } from 'src/plugins'
import { renderTableCell } from 'src/components/base/helper'
import { get } from 'lodash'

type SubProps = {
  config: any
}
const SubTable = (props: SubProps) => {
  const edit = useContext(EditContext)

  // 配置的头部按钮
  const headerBtns = useMemo(() => {
    const { Nav_Btns = [] } = props.config
    if (!Nav_Btns.length) return null
    return (
      <div className='edit-page__subtable-header'>
        {Nav_Btns.map((btn: any) => <LoadableButton key={btn.ID} pageType={$consts['TABLE/FORM_TYPE_EDIT_PAGE']} config={btn} />)}
      </div>
    )
  }, [props.config])

  const columns = useMemo(() => {
    const { Nav_Columns = [] } = props.config
    return Nav_Columns.map((item: any) => {
      const { LABEL, FIELD_NAME } = item
      return {
        title: LABEL,
        dataIndex: FIELD_NAME,
        render: (text: any, record: any) => {
          return (
            <Popover trigger='click'>
              <span>{renderTableCell({ record, field: FIELD_NAME })}</span>
            </Popover>
          )
        }
      }
    })
  }, [props.config])

  const dataSource = useMemo(() => {
    return get(edit?.formBase, props.config?.NavFields)
  }, [props.config])

  return (
    <div className='edit-page__subtable'>
      {headerBtns}
      <Table
        pagination={false}
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  )
}

type Props = {
  configs: any[]
}
const EditPageSubTable = (props: Props) => {
  const { configs } = props
  if (!Array.isArray(configs) || !configs.length) return null

  return (
    <div className='mg-t12 border-top'>
      {configs.map((config: any, index: number) => <SubTable key={`edit-page__subtable-${index}`} config={config} />)}
    </div>
  )
}

export default EditPageSubTable