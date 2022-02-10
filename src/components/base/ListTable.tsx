import React, { useState, useMemo, useEffect } from 'react'
import { Table } from 'antd'
import { LoadableButton } from 'src/components'
import { commonStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { initFilter, getSingleRule, extendRules, addRuleAndGroups } from 'src/utils/common'
import { renderTableCell } from './helper'
import { isEqual, cloneDeep, pick } from 'lodash'

type Props = {
  formCode: string,
  singlePageTable?: boolean,
  radioEnable?: boolean,
  checkboxEnable?: boolean,
  selectedKeys?: Array<any>,
  onRef?: Function,
  onLoadedData?: Function,
  onSelectChange?: Function
}

// 获取 form 对应配置
const useFormOptions = (props: Props) => {
  /**
   * 获取 form 对应配置
   */
  const getFormOptions = () => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const payload = initFilter({ OrgId, Keyword: props.formCode })
    $api['table/getTablePageTables'](payload).then((res: any) => {
      res && setFormOptions(res)
    })
  }

  const [formOptions, setFormOptions] = useState()
  useEffect(() => {
    getFormOptions()
  }, [])

  return formOptions
}

// 获取 form 对应的 tables 表格的配置信息
const useTablesConfig = (props: Props) => {
  /**
   * 获取 form 对应的 tables 表格的配置信息
   * @param {Object} param0
   * @param {Object} param0.Nav_Form form 表单配置
   * @param {Array}  param0.Nav_Tables form 对应 tables 数据
   */
  const getTablesConfig = ({ Nav_Form, Nav_Tables }: any) => {
    const { ORG_ID: OrgId, ID } = commonStore.userinfo
    // TODO 获取用户自定义配置
    // 获取 table 配置
    const promiseFunc = (table: any) => {
      const payload = initFilter({ OrgId, Sort: 'NUM', Parameter1: ID })
      const singleRule = getSingleRule('ID', 1, table.ID)
      extendRules(payload.FilterGroup, singleRule)
      return $api['table/getTablePageConfigInfo'](payload)
    }
    Promise.all(
      Nav_Tables.map((table: any) => promiseFunc(table))
    ).then(datas => {
      setTablesConfig(datas.filter(item => item))
    })
  }

  const [tablesConfig, setTablesConfig] = useState<any>()

  const formOptions = useFormOptions(props)
  useEffect(() => {
    formOptions && getTablesConfig(formOptions)
  }, [formOptions])

  return tablesConfig
}

// 获取 tables 对应数据
const useTablesData = (props: Props, pageOption: { PageIndex: number, Limit: number }): any => {
  /**
   * 获取 table dataSource
   * @param {Object} option table 配置
   * @param {Array}  option.Nav_Columns table columns
   * @param {Object} option.PageTable table 配置
   * @param {Array}  option.Btns table 按钮
   * @param {Array}  option.RowBtns table row 行按钮
   * @param {Array}  option.TableParams table dataSource 过滤参数
   * @param {Object} extraData table 请求的额外参数
   */
  const getTableData = (option: any, extraData: Object) => {
    /**
     * 根据表格操作行按钮生成对应的 columns
     * @param {Array} btns table row 行按钮
     * @returns 
     */
    const getTableOperateColumns = (btns: Array<any>): Array<any> => {
      if (!Array.isArray(btns) || !btns.length) return []

      return [{
        title: <span className='mg-l6 mg-r4'>操作</span>,
        key: 'operate-column',
        render: () => {
          return (
            <div className='operate-column'>
              {
                btns.map(btn => (
                  <div key={btn.ID} className='operate-column__btn'>
                    <LoadableButton pageType={$consts['TABLE/FORM_TYPE_LIST_PAGE']} config={btn} />
                  </div>
                ))
              }
            </div>
          )
        }
      }]
    }

    /**
     * 获取 table columns
     * @param {Object} option
     * @param {Array}  option.Nav_Columns table columns
     * @param {Object} option.PageTable table 配置
     * @param {Array}  option.RowBtns table row 行按钮
     */
    const getTableColumns = ({ Nav_Columns = [], PageTable, RowBtns }: any) => {
      const columns = []
      if (PageTable.IS_SHOW_ROW_NO) {
        columns.push({ title: '序号', key: 'ROW_NO', dataIndex: 'ROW_NO', width: 80 })
      }
      Nav_Columns.forEach((col: any) => {
        const { IS_DEFAULT, LABEL, FIELD_NAME } = col
        if (IS_DEFAULT) {
          columns.push({
            title: LABEL,
            key: FIELD_NAME,
            dataIndex: FIELD_NAME,
            render: (text: any, record: any) => {
              return renderTableCell({ record, field: FIELD_NAME })
            }
          })
        }
      })
      return columns.concat(getTableOperateColumns(RowBtns))
    }

    /**
     * 获取 table dataSource 请求参数
     * @param {Object} param0
     * @param {Array}  param0.Nav_Columns table columns
     * @param {Object} param0.PageTable table 配置
     * @param {Array}  param0.TableParams table dataSource 过滤参数
     */
    const getTableLoadPayload = ({ Nav_Columns = [], PageTable, TableParams }: any) => {
      // 数据库 SelectField 参数
      const {
        SORT: Sort = 'CREATE_TIME',
        ORDER: Order = PageTable.SORT ? PageTable.ORDER : 1,
        DefaultPageSize: Limit,
        NO_SELECT_FIELD
      } = PageTable

      const SelectField = Nav_Columns.map((item: any) => item.FIELD_NAME).filter((item: any) => item !== 'null')
      if (SelectField.length && !NO_SELECT_FIELD) {
        SelectField.indexOf('ID') === -1 && SelectField.push('ID')
        SelectField.indexOf('ORG_ID') === -1 && SelectField.push('ORG_ID')
      }

      // payload 请求参数
      const { ORG_ID: OrgId } = commonStore.userinfo
      const payload = initFilter({ OrgId, Sort, Order, Limit, SelectField })

      // 过滤参数
      const filterRules: any = []
      if (Array.isArray(TableParams) && TableParams.length) {
        TableParams.forEach(item => {
          filterRules.push({
            isCustom: item.IS_CUSTOM,
            isSysParam: item.IS_SYS_PARAM,
            field: item.FIELD_NAME,
            operator: item.OPERATION,
            value: item.VALUE
          })
        })
      }
      if (filterRules.length) {
        addRuleAndGroups(payload, { rules: filterRules })
      }
      return Object.assign(payload, extraData)
    }

    return new Promise((resolve) => {
      const payload = getTableLoadPayload(option)
      const { PageTable } = option
      let dataSource: any = []
      let dataTotal = 0
      $api['app/getDataByPost'](payload, { url: PageTable.API_URL, fullData: true })
        .then((res: any) => {
          if (res?.IsSuccessful) {
            if (res?.Data?.length) {
              PageTable.IS_SHOW_ROW_NO && res.Data.forEach((item: any, index: number) => item.ROW_NO = index + 1)
              dataSource = res.Data
              dataTotal = res.TotalCount
            }
          }
        }).finally(() => {
          resolve({
            config: option,
            data: {
              columns: getTableColumns(option),
              dataSource,
              dataTotal
            }
          })
        })
    })
  }

  // tables: [{ config, data: { columns, dataSource, dataTotal } }]
  const [tables, setTables] = useState<any>()

  const tablesConfig = useTablesConfig(props)
  useEffect(() => {
    if (tablesConfig && tablesConfig.length) {
      Promise.all(
        tablesConfig.map((option: any) => getTableData(option, pageOption))
      ).then(datas => {
        setTables(datas.filter(item => item))
      })
    }
  }, [tablesConfig, pageOption])

  return tables
}

const ListTableContext = React.createContext<any>(undefined)
const ListTable = (props: Props) => {
  // table 数据
  const [tableData, setTableData] = useState({
    columns: [],
    dataSource: []
  })

  // table 配置
  const [tableConfig, setTableConfig] = useState()

  // 分页数据
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const handleTableChange = (page: any) => {
    !isEqual(pagination, page) && setPagination(page)
  }

  // 分页请求参数
  const [pageOption, setPageOption] = useState({ PageIndex: 1, Limit: 10 })
  useEffect(() => {
    const { current: PageIndex, pageSize: Limit } = pagination
    const newOption = { PageIndex, Limit }
    setPageOption(prev => !isEqual(prev, newOption) ? newOption : prev)
  }, [pagination.current, pagination.pageSize])

  // 获取 table 配置与数据
  const tablesData = useTablesData(props, pageOption)
  useEffect(() => {
    if (tablesData && tablesData.length) {
      // data: { columns, dataSource, dataTotal }
      const { data, config } = tablesData[0]
      setTableData(pick(data, ['columns', 'dataSource']))
      setTableConfig(config)
      setPagination(prev => {
        if (prev.total === data.dataTotal) return prev

        let { current, pageSize } = prev
        return {
          current: current * pageSize > Math.ceil(data.dataTotal / pageSize) * pageSize ? current - 1 : current,
          pageSize,
          total: data.dataTotal
        }
      })
      props.onLoadedData instanceof Function && props.onLoadedData(cloneDeep({ data, config }))
    }
  }, [tablesData])

  // 当前选中
  const [selectedKeys, setSelectedKeys] = useState<any>([])
  useEffect(() => {
    setSelectedKeys((prev: any) => !isEqual(prev, props.selectedKeys) ? props.selectedKeys : prev)
  }, [props.selectedKeys])

  // 选中 record
  const [selectedData, setSelectedData] = useState({})
  const handleRenderRow = (record: any) => {
    return {
      onClick: () => {
        setSelectedData([tableData.dataSource.find((item: any) => item.ID === record.ID)])
      }
    }
  }
  useEffect(() => {
    const { dataSource } = tableData
    const newData = dataSource.filter((item: any) => selectedKeys.indexOf(item.ID) !== -1)
    setSelectedData(prev => !isEqual(prev, newData) ? newData : prev)
  }, [tableData.dataSource, selectedKeys])

  // table 单选、多选
  const rowSelection = useMemo<any>(() => {
    const { radioEnable, checkboxEnable } = props
    if (!radioEnable && !checkboxEnable) return

    return {
      fixed: true,
      type: radioEnable ? 'radio' : checkboxEnable ? 'checkbox' : '',
      columnWidth: 32,
      selectedRowKeys: selectedKeys,
      onChange: (newKeys: any) => {
        if (!isEqual(newKeys, selectedKeys)) {
          setSelectedKeys(newKeys)
          props.onSelectChange instanceof Function && props.onSelectChange(newKeys)
        }
      }
    }
  }, [props.radioEnable, props.checkboxEnable, selectedKeys])

  // context value
  const contextValue = useMemo(() => {
    const { dataSource } = tableData
    return {
      tableConfig,
      dataSource,
      selectedKeys,
      selectedData,
      reload: () => setPageOption(prev => ({ ...prev }))
    }
  }, [tableData.dataSource, tableConfig, selectedKeys, selectedData])
  useEffect(() => {
    props.onRef instanceof Function && props.onRef(contextValue)
  }, [contextValue])

  // 自适应滚动
  const [scroll, setScroll] = useState({ x: undefined, y: undefined })
  useEffect(() => {
    const newScroll: any = { x: undefined, y: undefined }
    const wrapper = document.getElementsByClassName('list-table')[0]
    const list = wrapper.getElementsByTagName('table')[0]
    list.offsetWidth > wrapper.clientWidth && (newScroll.x = true)
    list.offsetHeight > wrapper.clientHeight && (newScroll.y = true)
    setScroll(prev => !isEqual(prev, newScroll) ? newScroll : prev)
  })

  return (
    <ListTableContext.Provider value={contextValue}>
      <div className='list-table'>
        <Table
          rowKey='ID'
          dataSource={tableData.dataSource}
          columns={tableData.columns}
          pagination={props.singlePageTable ? false : pagination}
          rowSelection={rowSelection}
          onRow={handleRenderRow}
          onChange={handleTableChange}
          scroll={scroll}
        />
      </div>
    </ListTableContext.Provider>
  )
}

ListTable.defaultProps = {
  singlePageTable: false,
  radioEnable: false,
  checkboxEnable: false,
  selectedKeys: []
}

export { ListTableContext }
export default ListTable