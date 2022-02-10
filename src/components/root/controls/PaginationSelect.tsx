import { useState, useMemo, useContext } from 'react'
import { Form } from 'antd'
import { EditContext, PaginationSelect as ControlSelect } from 'src/components'
import { commonStore } from 'src/stores'
import { $api } from 'src/plugins'
import { initFilter, getSingleRule, extendRules } from 'src/utils/common'
import { get } from 'lodash'
import { ControlProps } from 'src/components/root/LoadableControl'

const PaginationSelect = (props: ControlProps) => {
  const [source, setSource] = useState([])
  const getSource = (params: any) => {
    const { INPUT_DATA_API: url, Nav_Filters: filters } = props.config
    if (!url) return new Promise(resolve => { resolve(false) })

    const { current: PageIndex, search, initSearch } = params
    const { ORG_ID: OrgId } = commonStore.userinfo
    const payload = initFilter({ OrgId, PageIndex })
    // 搜索过滤字段
    const singleRule = [getSingleRule('NAME', 9, search)]
    !search && initSearch && singleRule.push(getSingleRule('ID', 1, initSearch))
    // 配置过滤字段
    Array.isArray(filters) && filters.length && filters.forEach(item => {
      singleRule.push(getSingleRule(item.FIELD_NAME, item.OPERATION, item.VALUE))
    })
    extendRules(payload.FilterGroup, singleRule)

    return $api['app/getDataByPost'](payload, {
      url,
      fullData: true
    }).then((res: any) => {
      res && res.Data && setSource(res.Data)
      return res
    })
  }

  const edit = useContext(EditContext)

  /**
   * 获取额外保存字段
   * @param {*} val 
   */
  const getExtraSaveField = (val: string | number) => {
    const extraFields: any = {}
    /**
     * FIELD_NAME: 配置保存的字段
     * INPUT_NAV_FIELD: 导航字段，比如 NAME，则从选中的项中取 NAME 字段的值，保存在保存字段中
     * INPUT_SAVE_FIELD: 保存字段，该字段通过 INPUT_NAV_FIELD 字段赋值后，一并提交给后端
     */
    const { INPUT_NAV_FIELD: nav, INPUT_SAVE_FIELD: save } = props.config
    if (nav && save) {
      const target: any = source.find((item: any) => item.ID === val)
      const navs = nav.split(',')
      const saves = save.split(',')
      navs.forEach((item: any, index: number) => {
        target && target[item] && (extraFields[saves[index]] = target[item])
      })
    }
    return extraFields
  }

  const handleChange = (val: string | number) => {
    const extraFields = getExtraSaveField(val)
    const { FIELD_NAME } = props.config
    // 表单数据
    props.onChange instanceof Function && props.onChange({ [FIELD_NAME]: val, ...extraFields })
  }

  const value = useMemo(() => {
    const { FIELD_NAME } = props.config
    return get(edit?.formBase, FIELD_NAME)
  }, [edit, props.config])

  const { evtConfig = {} } = props
  const { hidden = false, disabled = false } = evtConfig

  if (hidden) return null

  const { LABEL, REQUIRED } = props.config
  return (
    <Form.Item
      label={LABEL}
      required={REQUIRED}
      validateStatus={props.verify ? 'error' : undefined}
    >
      <ControlSelect
        value={value}
        remoteMethod={getSource}
        onChange={handleChange}
        selectProps={{
          allowClear: true,
          disabled
        }}
        style={{ width: '100%' }}
      />
    </Form.Item>
  )
}

export default PaginationSelect