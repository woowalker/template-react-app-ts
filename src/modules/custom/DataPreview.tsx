import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { useLocation } from 'react-router-dom'
import { Form, Select, Input, Button, DatePicker, Tabs, message } from 'antd'
import { CameraOutlined, SearchOutlined } from '@ant-design/icons'
import { EnergyIcon } from 'src/components'
import { DataPreviewRealtime, DataPreviewAvg, DataPreviewTwosigma, DataPreviewHistory } from './components'
import { commonStore, loadingStore } from 'src/stores'
import { $api, $consts, $evt } from 'src/plugins'
import queryString from 'query-string'
import moment from 'moment'
import { cloneDeep } from 'lodash'
import 'src/styles/modules/custom/dataPreview.less'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

type FilterProps = {
  currTab: string,
  previewType: string,
  controlDetail: any,
  onFilterChange: Function
}
const Filter = (props: FilterProps) => {
  // 控制器下的测量对象与执行器列表
  const filterList = useMemo(() => {
    const { MVList: mvList = [], CVList: cvList = [] } = props.controlDetail
    return { mvList, cvList }
  }, [props.controlDetail])

  // 测量对象下的执行器筛选列表
  const [actFilterList, setActFilterList] = useState<any[]>([])

  // 执行器下的测量对象筛选列表
  const [meaFilterList, setMeaFilterList] = useState<any[]>([])

  const options = useMemo(() => {
    switch (props.previewType) {
      case $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']:
        return {
          mvList: filterList.mvList,
          cvList: meaFilterList
        }
      case $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE']:
        return {
          mvList: actFilterList,
          cvList: filterList.cvList
        }
      default:
        return filterList
    }
  }, [props.previewType, filterList, actFilterList, meaFilterList])

  // 测量对象与执行器过滤
  const [filter, setFilter] = useState({ ActuatorId: [], MeasuringObjectId: [] })
  useEffect(() => {
    const initFilter: any = { ActuatorId: [], MeasuringObjectId: [] }
    switch (props.previewType) {
      case $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']:
        {
          const ActuatorId = filterList.mvList[0]?.Id
          if (ActuatorId) {
            initFilter.ActuatorId.push(ActuatorId)
            // 获取控制器下测量对象列表
            $api['datapreview/getMeasuringObjectListByActuator']({
              ControllerId: props.controlDetail.Id,
              ActuatorId
            }).then((res: any[]) => {
              if (res && Array.isArray(res)) {
                res.forEach((item: any) => {
                  initFilter.MeasuringObjectId.push(item.Id)
                })
                setMeaFilterList(res)
                setFilter(initFilter)
              }
            })
          }
        }
        break
      case $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE']:
        {
          const MeasuringObjectId = filterList.cvList[0]?.Id
          if (MeasuringObjectId) {
            initFilter.MeasuringObjectId.push(MeasuringObjectId)
            // 获取测量对象下控制器列表
            $api['datapreview/getActuatorListByMeasuringObject']({
              ControllerId: props.controlDetail.Id,
              MeasuringObjectId
            }).then((res: any[]) => {
              if (res && Array.isArray(res)) {
                res.forEach((item: any) => {
                  initFilter.ActuatorId.push(item.Id)
                })
                setActFilterList(res)
                setFilter(initFilter)
              }
            })
          }
        }
        break
    }
  }, [props.previewType, props.controlDetail, filterList])

  // 获取对应执行器和测量对象列表
  useEffect(() => {
    props.onFilterChange(filter)
  }, [filter])

  // CMD 预览
  const [preview, setPreview] = useState('')
  useEffect(() => {
    $evt.emit($consts['DATAPREVIEW/EVT_CMDPREVIEW'], preview)
  }, [preview])

  // 附加的快照以及导出按钮
  const btns = useMemo(() => {
    // 快照
    const handleSnapshot = () => {
      if (props.previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
        $api['datapreview/setSnapshotByActuator']({
          ControllerId: props.controlDetail.Id,
          ActuatorId: filter.ActuatorId[0],
          MeasuringObjectIds: filter.MeasuringObjectId
        }).then((res: any) => {
          if (res) {
            message.success('操作成功')
            $evt.emit($consts['DATAPREVIEW/EVT_SNAPSHOT'])
          }
        })
        return
      }
      $api['datapreview/setSnapshotByMeasuringObject']({
        ControllerId: props.controlDetail.Id,
        ActuatorIds: filter.ActuatorId,
        MeasuringObjectId: filter.MeasuringObjectId[0]
      }).then((res: any) => {
        if (res) {
          message.success('操作成功')
          $evt.emit($consts['DATAPREVIEW/EVT_SNAPSHOT'])
        }
      })
    }

    // 导出
    const handleExport = () => { }

    switch (props.previewType) {
      case $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']:
        if (props.currTab === 'realtime-data') {
          return <Button type='primary' icon={<CameraOutlined />} onClick={handleSnapshot}>快照</Button>
        }
        if (props.currTab === 'history-data') {
          return (
            <React.Fragment>
              <Button
                type={preview === $consts['DATAPREVIEW/PREVIEW_TYPE_CD'] ? 'primary' : 'default'}
                onClick={() => setPreview($consts['DATAPREVIEW/PREVIEW_TYPE_CD'])}
              >CD预览</Button>
              <Button
                type={preview === $consts['DATAPREVIEW/PREVIEW_TYPE_MD'] ? 'primary' : 'default'}
                onClick={() => setPreview($consts['DATAPREVIEW/PREVIEW_TYPE_MD'])}
                className='mg-l8'
              >MD预览</Button>
              {preview ? <Button type='primary' onClick={() => setPreview('')} className='mg-l8'>返回</Button> : null}
            </React.Fragment>
          )
        }
        return null
      case $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE']:
        if (props.currTab === 'realtime-data') {
          return (
            <React.Fragment>
              <Button type='primary' icon={<CameraOutlined />} onClick={handleSnapshot}>快照</Button>
              <Button type='primary' icon={<CameraOutlined />} onClick={handleExport} className='mg-l8'>导出</Button>
            </React.Fragment>
          )
        }
        if (props.currTab === 'history-data') {
          return (
            <React.Fragment>
              <Button
                type={preview === $consts['DATAPREVIEW/PREVIEW_TYPE_CD'] ? 'primary' : 'default'}
                onClick={() => setPreview($consts['DATAPREVIEW/PREVIEW_TYPE_CD'])}
              >CD预览</Button>
              <Button
                type={preview === $consts['DATAPREVIEW/PREVIEW_TYPE_MD'] ? 'primary' : 'default'}
                onClick={() => setPreview($consts['DATAPREVIEW/PREVIEW_TYPE_MD'])}
                className='mg-l8'
              >MD预览</Button>
              {preview ? <Button type='primary' onClick={() => setPreview('')} className='mg-l8'>返回</Button> : null}
              <Button type='primary' icon={<CameraOutlined />} onClick={handleExport} className='mg-l8'>导出</Button>
            </React.Fragment>
          )
        }
        return <Button type='primary' icon={<CameraOutlined />} onClick={handleExport}>导出</Button>
      default:
        return null
    }
  }, [props.currTab, props.previewType, props.controlDetail, filter, preview])

  return (
    <Form layout='inline'>
      <Form.Item label='CD执行器'>
        <Select
          mode={props.previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE'] ? 'multiple' : undefined}
          maxTagCount={1}
          fieldNames={{ label: 'Name', value: 'Id' }}
          options={options.mvList}
          value={filter.ActuatorId}
          onChange={(val: any) => setFilter({ ...filter, ActuatorId: val })}
          style={{ width: 200 }}
        />
      </Form.Item>
      <Form.Item label='CD测量对象'>
        <Select
          mode={props.previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'] ? 'multiple' : undefined}
          maxTagCount={1}
          fieldNames={{ label: 'Name', value: 'Id' }}
          options={options.cvList}
          value={filter.MeasuringObjectId}
          onChange={(val: any) => setFilter({ ...filter, MeasuringObjectId: val })}
          style={{ width: 200 }}
        />
      </Form.Item>
      {btns}
    </Form>
  )
}

const DataPreview = () => {
  const location = useLocation()
  const OrgId = useMemo(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const target = queryString.parse(location.search)
    return target.OrgId || OrgId
  }, [location.search])

  // 控制器组
  const [group, setGroup] = useState<any>({})
  useEffect(() => {
    $api['controlmonitor/getGroupInfo']({ OrgId }).then((res: any) => {
      res && setGroup(res)
    })
  }, [])

  // 控制器组下的控制器列表
  const controlList = useMemo(() => {
    return group.Controllers || []
  }, [group])

  // 控制器
  const [controlId, setControlId] = useState<string | number>('')
  useEffect(() => {
    group.Controllers && setControlId(group.Controllers[0]?.Id || '')
  }, [group])
  const missControlId = (show?: boolean): boolean => {
    !controlId && show && message.error('请选择控制器')
    return !controlId
  }

  // 控制器详情
  const [controlDetail, setControlDetail] = useState<any>({})
  const getControlDetail = () => {
    if (missControlId()) return

    $api['datapreview/getControllerInfo']({
      ControllerId: controlId
    }).then((res: any) => {
      if (res) {
        setControlDetail(res)
      }
    })
  }
  useEffect(() => {
    getControlDetail()
  }, [controlId])

  // 过滤时间
  const [timeRange, setTimeRange] = useState<any>([moment().subtract(10, 'minutes'), moment()])
  const handleTimeChange = (dates: any) => {
    dates = [moment(dates[0].format('YYYY-MM-DD HH:mm')), moment(dates[1].format('YYYY-MM-DD HH:mm'))]
    const copyDates = cloneDeep(dates)
    const isSame = copyDates[1].isSame(copyDates[0])
    const isAfter = copyDates[1].isAfter(copyDates[0].add(1, 'hours'))
    if (isSame || isAfter) {
      isAfter && message.warning('只能查询1小时区间段的数据')
      setTimeRange([dates[0], cloneDeep(dates[0]).add(10, 'minutes')])
      return
    }
    setTimeRange(dates)
  }

  // 测量对象预览或执行器预览
  const [previewType, setPreviewType] = useState($consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'])

  // 执行器和测量对象过滤
  const [filter, setFilter] = useState()

  // 当前 tab
  const [currTab, setCurrTab] = useState('realtime-data')

  return (
    <div className='data-preview'>
      <div className='data-preview__header'>
        <div className='data-preview__header-form'>
          <Form layout='inline'>
            <Form.Item label='控制器组'>
              <Input disabled value={group.GroupName} className='data-preview__form-input' />
            </Form.Item>
            <Form.Item label='控制器'>
              <Select
                fieldNames={{ label: 'Name', value: 'Id' }}
                options={controlList}
                value={controlId}
                onChange={setControlId}
                style={{ width: 120 }}
              />
            </Form.Item>
            <Form.Item label='产品批号'>
              <Input disabled value={group.LotNumber} className='data-preview__form-input' />
            </Form.Item>
            <Form.Item label='扫描周期'>
              <Input
                disabled
                value={controlDetail.ScanCycle}
                addonAfter={controlDetail.CycleUnit}
                className='data-preview__form-input'
              />
            </Form.Item>
          </Form>
          <Button
            type={previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'] ? 'primary' : 'default'}
            icon={<EnergyIcon type='icon-PLCzhihangqi' className='pd-r8' />}
            onClick={() => {
              setPreviewType($consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'])
              setFilter(undefined)
            }}
            className='mg-r8'
          >执行器预览</Button>
          <Button
            type={previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE'] ? 'primary' : 'default'}
            icon={<EnergyIcon type='icon-celiang' className='pd-r8' />}
            onClick={() => {
              setPreviewType($consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE'])
              setFilter(undefined)
            }}
            className='mg-l8'
          >测量对象预览</Button>
        </div>
        {
          currTab !== 'realtime-data'
            ? (
              <div className='data-preview__header-form'>
                <Form layout='inline'>
                  <Form.Item label='选择时间'>
                    <RangePicker
                      allowClear={false}
                      showTime={{ format: 'HH:mm' }}
                      format='YYYY-MM-DD HH:mm'
                      value={timeRange}
                      onChange={handleTimeChange}
                      style={{ width: 300 }}
                    />
                  </Form.Item>
                  <Form.Item label=''>
                    <Button
                      type='primary'
                      icon={<SearchOutlined />}
                      loading={loadingStore.visible}
                      onClick={() => setTimeRange([...timeRange])}
                    >查询</Button>
                  </Form.Item>
                </Form>
              </div>
            )
            : null
        }
      </div>
      <div className='data-preview__tabs'>
        <Tabs
          animated={false}
          activeKey={currTab}
          onChange={setCurrTab}
          tabBarExtraContent={
            <Filter
              currTab={currTab}
              previewType={previewType}
              controlDetail={controlDetail}
              onFilterChange={setFilter}
            />
          }
        >
          <TabPane tab='实时数据' key='realtime-data'>
            <DataPreviewRealtime
              previewType={previewType}
              filter={filter}
              controlId={controlId}
            />
          </TabPane>
          <TabPane tab='历史数据' key='history-data'>
            <DataPreviewHistory
              previewType={previewType}
              filter={filter}
              controlId={controlId}
              timeRange={timeRange}
            />
          </TabPane>
          <TabPane tab='平均数据' key='average-data'>
            <DataPreviewAvg
              previewType={previewType}
              filter={filter}
              controlId={controlId}
              timeRange={timeRange}
            />
          </TabPane>
          <TabPane tab='2σ数据' key='xigema-data'>
            <DataPreviewTwosigma
              previewType={previewType}
              filter={filter}
              controlId={controlId}
              timeRange={timeRange}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default observer(DataPreview)