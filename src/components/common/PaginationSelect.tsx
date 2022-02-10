import { useState, useEffect } from 'react'
import { Pagination, Select, Divider, Spin, Typography } from 'antd'
import { get, debounce } from 'lodash'
import 'src/styles/components/common/paginationSelect.less'

const { Option } = Select
const { Paragraph } = Typography

type Props = {
  name?: string,
  value?: string | number,
  remoteMethod: Function,
  onChange?: Function,
  selectProps?: any,
  paginationProps?: Object,
  dataField?: string,
  dataTotalField?: string,
  optionKeyField?: string,
  optionLabelField?: string,
  debounceTime?: number,
  style?: Object
}

function PaginationSelect (props: Props) {
  const [data, setData] = useState([])
  const [dataTotal, setDataTotal] = useState(0)
  const [dataLoading, setDataLoading] = useState(false)

  /**
   * 搜索与远程搜索
   */
  const [search, setSearch] = useState('')
  const [showData, setShowData] = useState([])

  const debounceSearch = debounce((val) => {
    setSearch(val)
    setCurrent(1)
  }, props.debounceTime)
  const handleSearch = (value: string) => {
    const { optionKeyField = '', optionLabelField = '' } = props
    if (value) {
      const filterResult = data.filter((item: any) => {
        return item[optionKeyField].toLowerCase().indexOf(value.toLowerCase()) !== -1 || item[optionLabelField].toLowerCase().indexOf(value.toLowerCase()) !== -1
      })
      filterResult.length ? setShowData(filterResult) : debounceSearch(value)
    } else {
      debounceSearch('')
    }
  }

  const handleChange = (value: string | number) => {
    const { onChange } = props
    onChange instanceof Function && onChange(value)
  }

  useEffect(() => {
    setShowData(data)
  }, [data])

  /**
   * 分页数据的首次搜索
   * initSearch: 默认ID值
   */
  const [initSearch, setInitSearch] = useState<any>('')
  useEffect(() => {
    if (initSearch !== props.value) {
      setInitSearch(props.value)
      setCurrent(1)
    }
  }, [props.value, initSearch])

  /**
   * 分页
   */
  const [current, setCurrent] = useState(1)
  const [promiseQueue] = useState<any>([])

  useEffect(() => {
    // 此处逻辑是为了保证调用顺序和接口返回数据一致，避免调用两次，而第二次的数据返回快于第一次的情况
    if (!promiseQueue.length || !promiseQueue[0].done) {
      promiseQueue.push({
        done: false,
        doing: false,
        func: () => {
          const { name, remoteMethod, dataField = '', dataTotalField = '' } = props
          if (remoteMethod instanceof Function) {
            return remoteMethod({
              name,
              initSearch,
              search,
              current
            }).then((res: any) => {
              if (res && res.IsSuccessful) {
                setData(get(res, dataField))
                setDataTotal(get(res, dataTotalField))
              }
            })
          } else {
            return Promise.resolve()
          }
        }
      })
    }

    function loop (arr: any) {
      if (!arr[0].done && !arr[0].doing) {
        arr[0].doing = true
        setDataLoading(true)
        arr[0].func().finally(() => {
          setDataLoading(false)
          arr.splice(0, 1)
          arr.length && loop(arr)
        })
      }
    }

    loop(promiseQueue)
  }, [initSearch, search, current])

  const { value, selectProps, paginationProps, optionKeyField = '', optionLabelField = '' } = props
  return (
    <Select
      loading={dataLoading}
      {...selectProps}
      value={value}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      dropdownRender={(menu: any) => (
        <Spin spinning={selectProps.loading || dataLoading}>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          <Pagination
            size='small'
            total={dataTotal}
            style={{ textAlign: 'center' }}
            {...paginationProps}
            current={current}
            onChange={page => setCurrent(page)}
          />
        </Spin>
      )}
      style={props.style}
    >
      {
        showData.map(item => {
          const label = get(item, optionLabelField)
          const value = get(item, optionKeyField)
          return (
            <Option key={value} value={value} title={label}>
              <div className='text-overflow pagination-select__option'>
                <span>{label}</span>
                <Paragraph
                  onClick={(evt: any) => evt.stopPropagation()}
                  copyable={{ text: label, tooltips: ['复制', '成功'] }}
                  className='pagination-select__copyable'
                />
              </div>
            </Option>
          )
        })
      }
    </Select>
  )
}

PaginationSelect.defaultProps = {
  name: '',
  value: '',
  remoteMethod: () => [],
  onChange: () => [],
  selectProps: {
    loading: false,
    defaultActiveFirstOption: false,
    placeholder: '请选择'
  },
  paginationProps: {},
  dataField: 'Data',
  dataTotalField: 'TotalCount',
  optionKeyField: 'ID',
  optionLabelField: 'NAME',
  debounceTime: 500,
  style: { width: '100%' }
}

export default PaginationSelect
