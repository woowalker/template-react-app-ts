import React, { useState, useEffect, useMemo, useRef } from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { useLocation } from 'react-router-dom'
import { Form, Select, Input, InputNumber, Checkbox, Button, Divider, message } from 'antd'
import { CameraOutlined, SettingOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons'
import { NowTime, CountTime, EnergyIcon, EasyModal, Loading, CollpaseZone } from 'src/components'
import { ControlConfigSet, CDChartShow, TargetOffset, SPValueImport } from './components'
import { commonStore, controlStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { useLatest } from 'src/hooks'
import Socket from 'src/utils/socket'
import { getBaseURL, getSocketURL } from 'src/utils/tools'
import queryString from 'query-string'
import { cloneDeep, pick, isEqual } from 'lodash'
import { ffc355And5bb86d, dashLine_bcbcbc } from 'src/assets/base64'
import 'src/styles/modules/custom/controlMonitor.less'

const intervalTime = 5000
const ControlMonitor = () => {
  const location = useLocation()
  const OrgId = useMemo(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const target = queryString.parse(location.search)
    return target.OrgId || OrgId
  }, [location.search])

  // 控制器组
  const [group, setGroup] = useState<any>({})
  const getGroupDetail = () => {
    $api['controlmonitor/getGroupInfo']({
      OrgId
    }).then((res: any) => {
      res && setGroup(res)
    }).finally(() => {
      controlStore.setGroupChangeStatus(true)
    })
  }
  useEffect(() => {
    getGroupDetail()
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
  const latestControlId = useLatest(controlId)

  // 控制器详情
  const [controlDetail, setControlDetail] = useState<any>({})
  const getControlDetail = () => {
    if (missControlId()) return

    $api['controlmonitor/getControllerInfo']({
      ControllerId: controlId
    }).then((res: any) => {
      if (res) {
        setControlDetail(res)
        setControlStatus(pick(res, ['Status', 'StatusInfo', 'MidStatus', 'MidStatusInfo']))
      }
    })
  }
  useEffect(() => {
    getControlDetail()
  }, [controlId])

  // 控制器中间状态
  const [controlStatus, setControlStatus] = useState<any>({})
  const getControlStatus = () => {
    if (missControlId()) return

    $api['controlmonitor/getControllerStatus']({
      ControllerId: controlId
    }).then((res: any) => {
      res && setControlStatus((prev: any) => isEqual(prev, res) ? prev : res)
    })
  }

  // 定时刷新控制器状态
  const refOfTimerStatus = useRef<any>(-1)
  useEffect(() => {
    refOfTimerStatus.current = setInterval(() => {
      getControlStatus()
    }, intervalTime)

    return () => clearInterval(refOfTimerStatus.current)
  }, [controlId])

  // 控制器下的测量对象与执行器列表
  const filterList = useMemo(() => {
    const { CVList: cvList = [], MVList: mvList = [] } = controlDetail
    return { cvList, mvList }
  }, [controlDetail])

  // 测量对象与执行器过滤
  const [filter, setFilter] = useState({ MeasuringObjectId: '', ActuatorId: '' })
  useEffect(() => {
    const initFilter = { MeasuringObjectId: '', ActuatorId: '' }
    filterList.cvList[0]?.Id && (initFilter.MeasuringObjectId = filterList.cvList[0].Id)
    filterList.mvList[0]?.Id && (initFilter.ActuatorId = filterList.mvList[0].Id)
    setFilter(initFilter)
  }, [filterList])
  const missFilterId = (show?: boolean): boolean => {
    const { MeasuringObjectId, ActuatorId } = filter
    !MeasuringObjectId && show && message.error('请选择测量对象')
    !ActuatorId && show && message.error('请选择执行器')
    return !MeasuringObjectId || !ActuatorId
  }

  // 控制器位号数据
  const [posData, setPosData] = useState<any>({ MeasuringObject: {}, Actuator: {} })
  const getPosData = () => {
    if (missControlId() || missFilterId()) return

    $api['controlmonitor/getPositionData']({
      ControllerId: controlId,
      ...filter
    }).then((res: any) => {
      res && setPosData((prev: any) => isEqual(prev, res) ? prev : res)
    })
  }

  // 定时刷新位号数据信息
  const refOfTimerPos = useRef<any>(-1)
  useEffect(() => {
    getPosData()

    refOfTimerPos.current = setInterval(() => {
      getPosData()
    }, intervalTime)

    return () => clearInterval(refOfTimerPos.current)
  }, [controlId, filter])

  // Slider 对应图表数据
  const [slider, setSlider] = useState(0)
  const [matchActChart, setMatchChartData] = useState<any>()
  const matchMeasureChart = useMemo(() => {
    const { PositionNumbers = [] } = posData.MeasuringObject
    return PositionNumbers.find((item: any) => item.PositionNumber === matchActChart?.AlignPositionNumber)
  }, [posData, matchActChart])

  // 手/自动组切换倒计时，该值倒计时结束后，表示手/自动组切换开始执行
  const [counter, setCounter] = useState(0)

  // 自动组切换倒计时，该值会更新 counter 值
  const [countTime, updateCountTime] = useState(0)
  useEffect(() => {
    group.LeavingSeconds && updateCountTime(group.LeavingSeconds)
  }, [group])

  // 自动组切换启禁用
  const handleAutoSwitchEnable = (Value: boolean, Type: number, silent?: boolean) => {
    if (missControlId(true)) return Promise.reject(false)

    return $api['controlmonitor/updateControllerEnableOption']({
      ControllerId: controlId,
      Type,
      Value
    }).then((res: boolean) => {
      if (res) {
        !silent && message.success('操作成功')
      }
    })
  }

  // 手动组切换
  const refOfTargetGroup = useRef()
  const handleGroupSwitch = (params: any) => {
    let { leftTime, targetGroup, targetTimes, timeType, } = params
    const start = () => {
      refOfTargetGroup.current = targetGroup
      updateCountTime(leftTime)
      message.success(`将在${targetTimes}${timeType === 'seconds' ? '秒' : timeType === 'minutes' ? '分钟' : '小时'}后进行组切换`)
    }
    if (group.IsAutoChangeGroup) {
      handleAutoSwitchEnable(false, $consts['CONTROLMONITOR/IS_AUTO_CHANGE_GROUP'], true).then(() => {
        start()
      })
    } else {
      start()
    }
  }

  // 组切换倒计时结束
  const handleSwitchCountDone = () => {
    message.success('正在为您切换组，请稍后...')
    // 停止状态和尾号数据的接口轮询
    clearInterval(refOfTimerStatus.current)
    clearInterval(refOfTimerPos.current)
    // 切换 loading
    controlStore.setGroupChangeStatus(false)
    // 手动切换
    if (refOfTargetGroup.current) {
      const NewGroupId = refOfTargetGroup.current
      refOfTargetGroup.current = undefined
      $api['controlmonitor/manualExchangeGroup']({
        NewGroupId
      }).then(() => {
        message.success('切换成功')
      }).catch(() => {
        message.error('切换失败')
      }).finally(() => {
        getGroupDetail()
      })
    }
  }

  // 组切换 loading
  const [groupChanging, setGroupChanging] = useState(false)
  useEffect(() => reaction(() => controlStore.groupChangeDone, (value) => {
    setGroupChanging(!value)
  }), [])

  // 执行器写入动画
  const [flicker, setFlicker] = useState<any>(false)
  const refOfTimerFlicker = useRef<any>(-1)
  useEffect(() => {
    clearTimeout(refOfTimerFlicker.current)
  }, [])

  // socket 实例
  const socket = useRef<any>()
  useEffect(() => {
    const handleSocketOnMsg = (data: any) => {
      if (!data) return

      const { TypeCode, Data } = JSON.parse(data)
      switch (TypeCode) {
        // 执行器写入成功
        case $consts['SOCKET/ACTUATOR_WRITE']:
          if (Data?.ControllerId === latestControlId.current) {
            setFlicker(Data)
            // 定时器展示动画
            clearTimeout(refOfTimerFlicker.current)
            refOfTimerFlicker.current = setTimeout(() => {
              setFlicker(false)
            }, 3000)
          }
          break
        // 页面刷新
        case $consts['SOCKET/PAGE_REFRESH']:
          getGroupDetail()
          break
      }
    }

    socket.current = new Socket({
      url: getSocketURL(),
      onmessage: handleSocketOnMsg
    })

    return () => {
      socket.current && socket.current.close()
    }
  }, [])

  // 设置选中位号的开闭环状态
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])

  // options 展开收起
  const [visible, setVisible] = useState(false)

  // 测量对象快照
  const handleMeasureSnapshot = () => {
    if (missControlId(true) || missFilterId(true)) return

    $api['controlmonitor/saveMeasuringObjectSnapshot']({
      Id: filter.MeasuringObjectId
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        getPosData()
      }
    })
  }

  // 执行器快照
  const handleActSnapshot = () => {
    if (missControlId(true) || missFilterId(true)) return

    $api['controlmonitor/saveActuatorSnapshot']({
      Id: filter.ActuatorId
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        getPosData()
      }
    })
  }

  // 开闭环
  const handleLoop = (IsClose: boolean, type: string) => {
    if (missControlId(true) || missFilterId(true)) return

    // 全闭环、全开环
    if (type === 'all') {
      $api['controlmonitor/openOrCloseAllLoop']({
        ...filter,
        ControllerId: controlId,
        IsClose
      }).then((res: any) => {
        if (res) {
          message.success('操作成功')
          getPosData()
        }
      })
      return
    }
    if (!checkedKeys.length) {
      message.error('没有选中位号数据')
      return
    }
    $api['controlmonitor/openOrCloseLoop']({
      ...filter,
      ControllerId: controlId,
      IsClose,
      PositionNumbers: checkedKeys
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        getPosData()
      }
    })
  }

  // 手动设定 SP
  const [customActuator, setCustomActuator] = useState<any>({})
  const handleSetSPValue = (val: number) => {
    const { PositionNumbers = [] } = posData.Actuator
    const find: any = PositionNumbers.find((item: any) => item.PositionNumber === slider)
    if (find) {
      setCustomActuator({
        ...customActuator,
        [find.PositionNumber]: val
      })
    }
  }
  const chartActuator = useMemo(() => {
    const copyActuator = cloneDeep(posData.Actuator)
    const { PositionNumbers = [] } = copyActuator
    PositionNumbers.forEach((item: any) => {
      if (customActuator[item.PositionNumber] !== undefined) {
        item.SetSPValue = customActuator[item.PositionNumber]
      }
    })
    return copyActuator
  }, [customActuator, posData.Actuator])

  // 启动、停止、初始化
  const handleSetControl = (Cmd: number) => {
    if (missControlId(true)) return

    const find = controlList.find((item: any) => item.Id === controlId)
    $api['controlmonitor/setStatus']({
      Id: controlId,
      Name: find.Name,
      Cmd
    }).then((res: boolean) => {
      if (res) {
        message.success('操作成功')
        getControlDetail()
      }
    })
  }

  // 半闭环、DCS、调试
  const handleControlEnable = (Value: boolean, Type: number, field: string) => {
    if (missControlId(true)) return

    $api['controlmonitor/updateControllerEnableOption']({
      ControllerId: controlId,
      Type,
      Value
    }).then((res: boolean) => {
      if (res) {
        message.success('操作成功')
        setControlDetail({ ...controlDetail, [field]: Value })
      }
    })
  }

  // 写入操作
  const handleWrite = () => {
    if (missControlId(true) || missFilterId(true)) return

    const { PositionNumbers = [] } = chartActuator
    $api['controlmonitor/writeSetSPValue']({
      ActuatorId: filter.ActuatorId,
      ControllerId: controlId,
      PositionNumbers: PositionNumbers.map((item: any) => ({
        PositionNumber: item.PositionNumber,
        SPValue: item.SetSPValue
      }))
    }).then((res: any) => {
      res && message.success('操作成功')
    })
  }

  // 导出
  const handleExport = () => {
    if (missControlId(true) || missFilterId(true)) return

    const { Tenant: tenant } = commonStore.headers
    const actionApi = 'CFG/ControllerMonitor/ExportSPValue'
    const exportUrl = `${getBaseURL(actionApi)}/${actionApi}?ActuatorId=${filter.ActuatorId}&ControllerId=${controlId}&tenant=${tenant}`
    window.open(exportUrl, '_blank')
  }

  // 启动按钮是否禁用
  const startDisable = useMemo(() => {
    const { Status, MidStatus } = controlStatus
    return MidStatus !== $consts['CONTROLMONITOR/CONTROL_MID_NONE'] || (Status !== $consts['CONTROLMONITOR/CONTROL_CMD_STOP'] && Status !== $consts['CONTROLMONITOR/CONTROL_CMD_WAIT_BEGIN'])
  }, [controlStatus])

  // 停止按钮是否禁用
  const stopDisable = useMemo(() => {
    const { Status, MidStatus } = controlStatus
    return MidStatus !== $consts['CONTROLMONITOR/CONTROL_MID_NONE'] || Status !== $consts['CONTROLMONITOR/CONTROL_CMD_START']
  }, [controlStatus])

  // 启动状态GIF图
  const startStatusDom = useMemo(() => {
    const { Status, MidStatus } = controlStatus
    let gif = require('src/assets/custom/engine-stop.png').default
    if (MidStatus === $consts['CONTROLMONITOR/CONTROL_MID_NONE'] && Status === $consts['CONTROLMONITOR/CONTROL_CMD_START']) {
      gif = require('src/assets/custom/engine-start.gif').default
    }
    return <img src={gif} alt='' />
  }, [controlStatus])

  // 写入状态GIF图
  const writeStatusDom = useMemo(() => {
    if (!flicker) return null

    const { IsSuccess: ok } = flicker
    const gif = ok ? require('src/assets/custom/flicker.gif').default : require('src/assets/custom/flicker.gif').default
    const className = `pd-l8 fz-14 color-${ok ? 'success' : 'error'} fontweight-bolder vertical-middle`
    return (
      <React.Fragment>
        <img src={gif} alt='' />
        <span className={className}>{`写入${ok ? '成功' : '失败'}`}</span>
      </React.Fragment>
    )
  }, [flicker])

  // 目标组切换时间
  const groupLeftTime = useMemo(() => {
    const { LeavingSeconds: secs = 0 } = group
    const min = Math.floor(secs / 60)
    const sec = secs % 60
    return `${min}分${sec}秒`
  }, [group])

  // 测量对象图表 series 数据
  const measureSeries = [
    {
      field: 'PVValue',
      chartOption: {
        legend: { data: [{ icon: 'path://M0 0 H150 V12 H0 Z' }] },
        lineOption: {
          name: '当前值',
        }
      }
    },
    {
      field: 'SnapPVValue',
      chartOption: {
        legend: { data: [{ icon: 'path://M0 0 H150 V12 H0 Z' }] },
        lineOption: {
          name: '快照值',
        }
      }
    },
    {
      field: 'SPValue',
      chartOption: {
        legend: { data: [{ icon: `image://${dashLine_bcbcbc}` }] },
        lineOption: {
          name: '目标值',
          lineStyle: { type: 'dashed', color: '#bcbcbc' },
          areaStyle: { color: 'rgba(0,0,0,0)' }
        }
      }
    }
  ]

  // 测量对象图表配置
  const measureChart = useMemo(() => {
    const { PositionNumbers = [] } = posData.MeasuringObject
    const PVValues = PositionNumbers.map((item: any) => item.PVValue).filter((item: number) => item)
    const max = Math.max(...PVValues)
    const min = Math.min(...PVValues)
    return {
      title: { top: 40 },
      grid: { top: 60 },
      xAxis: { axisLabel: { showMinLabel: true, showMaxLabel: true } },
      dataZoom: [
        {
          type: 'slider',
          right: 10,
          width: 18,
          yAxisIndex: 0,
          filterMode: 'none',
          startValue: min || 0,
          endValue: max || undefined
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'none'
        }
      ]
    }
  }, [posData.MeasuringObject])

  // 执行器图表 series 数据
  const actSeries = useMemo(() => {
    const { PositionNumbers = [] } = chartActuator
    const barMaxWidth = 13 - Math.floor(PositionNumbers.length / 50) * 2
    return [
      {
        field: 'SetSPValue',
        checkLoop: true,
        chartOption: {
          legend: { data: [{ icon: `image://${ffc355And5bb86d}` }] },
          barOption: {
            name: '手动设定SP值',
            barMaxWidth
          }
        }
      },
      {
        field: 'PVValue',
        zeroToUndefined: true, // 0 值不画
        chartOption: {
          legend: { data: [{ icon: 'circle' }] },
          lineOption: {
            name: '当前PV',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { opacity: 0 },
            areaStyle: { color: 'rgba(0,0,0,0)' }
          },
        }
      }
    ]
  }, [chartActuator])

  // 执行器图表配置
  const actChart = useMemo(() => {
    const { PositionNumbers = [] } = chartActuator
    const maxInterval = Math.ceil(PositionNumbers.length / 50)
    return {
      title: { show: false },
      legend: { itemWidth: 24, itemHeight: 12 },
      xAxis: { maxInterval, axisTick: { show: false } }
    }
  }, [chartActuator])

  return (
    <React.Fragment>
      <div className='control-monitor'>
        {/** 配置以及控制 */}
        <div className='control-monitor__header'>
          <div className='control-monitor__header-form'>
            <Form layout='inline'>
              <Form.Item label='控制器组'>
                <Input disabled value={group.GroupName} className='control-monitor__form-input' />
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
                <Input disabled value={group.LotNumber} className='control-monitor__form-input' />
              </Form.Item>
              <Form.Item label='扫描周期'>
                <Input
                  disabled
                  value={controlDetail.ScanCycle}
                  addonAfter={controlDetail.CycleUnit}
                  className='control-monitor__form-input'
                />
              </Form.Item>
            </Form>
            <div className='control-monitor__header-gif'>
              {flicker ? writeStatusDom : startStatusDom}
              <div><span>{controlStatus.MidStatusInfo}</span></div>
            </div>
            <Button
              type='primary'
              disabled={startDisable}
              onClick={() => handleSetControl($consts['CONTROLMONITOR/CONTROL_CMD_START'])}
              className='mg-r8'
            >启动</Button>
            <Button
              danger
              disabled={stopDisable}
              onClick={() => handleSetControl($consts['CONTROLMONITOR/CONTROL_CMD_STOP'])}
              className='mg-l8'
            >停止</Button>
          </div>
          <div className='control-monitor__header-group'>
            <Checkbox
              checked={controlDetail.IsSemiClosedLoop}
              onChange={val => handleControlEnable(val.target.checked, $consts['CONTROLMONITOR/IS_SEMI_CLOSED_LOOP'], 'IsSemiClosedLoop')}
            >半闭环</Checkbox>
            <Checkbox
              checked={group.IsAutoChangeGroup}
              onChange={val => handleAutoSwitchEnable(val.target.checked, $consts['CONTROLMONITOR/IS_AUTO_CHANGE_GROUP'])}
            >自动组切换</Checkbox>
            <Checkbox
              checked={controlDetail.IsDCS}
              onChange={val => handleControlEnable(val.target.checked, $consts['CONTROLMONITOR/IS_DCS'], 'IsDCS')}
            >DCS</Checkbox>
            <Checkbox
              checked={controlDetail.IsDebug}
              onChange={val => handleControlEnable(val.target.checked, $consts['CONTROLMONITOR/IS_DEBUG'], 'IsDebug')}
            >调试</Checkbox>
          </div>
          <div className='control-monitor__header-control'>
            <Checkbox
              checked={controlDetail.IsAutoInit}
              onChange={val => handleControlEnable(val.target.checked, $consts['CONTROLMONITOR/IS_AUTO_INIT'], 'IsAutoInit')}
            >自动</Checkbox>
            <Button
              type='primary'
              disabled={controlDetail.IsAutoInit}
              onClick={() => handleSetControl($consts['CONTROLMONITOR/CONTROL_CMD_INIT'])}
            >初始化</Button>
            <Divider type='vertical' />
            <EasyModal
              title='功能配置'
              width='50%'
              slot={<Button type='primary' icon={<SettingOutlined />}>配置</Button>}
            >
              <ControlConfigSet
                group={group}
                controlDetail={controlDetail}
                counter={counter}
                onGroupSwitch={handleGroupSwitch}
                onSuccess={getControlDetail}
              />
            </EasyModal>
          </div>
        </div>
        {/** CD 测量对象图表 */}
        <CollpaseZone
          collapse={
            <React.Fragment>
              <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
                <Form.Item label='对齐位号'>
                  <InputNumber
                    disabled
                    value={matchActChart?.AlignPositionNumber}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='目标'>
                  <InputNumber
                    disabled
                    value={matchMeasureChart?.SPValue}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='当前值'>
                  <InputNumber
                    disabled
                    value={matchMeasureChart?.PVValue}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='最大值'>
                  <InputNumber
                    disabled
                    value={posData.MeasuringObject.MaxValue}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='最小值'>
                  <InputNumber
                    disabled
                    value={posData.MeasuringObject.MinValue}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='坐标上界'>
                  <InputNumber
                    disabled
                    value={posData.MeasuringObject.CoordinateMax}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='坐标下界'>
                  <InputNumber
                    disabled
                    value={posData.MeasuringObject.CoordinateMin}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
                <Form.Item label='2σ'>
                  <InputNumber
                    disabled
                    value={posData.MeasuringObject.TwoSigma}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
              </Form>
              <div className='mg-t20 text-center'>
                <EasyModal
                  title='测量目标偏置'
                  width='400px'
                  slot={<Button type='primary' className='mg-r16'>测量目标偏置</Button>}
                >
                  <TargetOffset
                    controlId={controlId}
                    mesuringObjectId={filter.MeasuringObjectId}
                    onSuccess={getControlDetail}
                  />
                </EasyModal>
                <Button type='primary' icon={<CameraOutlined />} onClick={handleMeasureSnapshot}>快照</Button>
              </div>
            </React.Fragment>
          }
          onChange={setVisible}
          zoneClass='border-top'
          zoneStyle={{ top: -1 }}
          zoneRightClass='pd-t12'
        >
          <Form layout='inline' className='pd-l12 pd-t12 mg-b6'>
            <Form.Item label='CD测量对象'>
              <Select
                fieldNames={{ label: 'Name', value: 'Id' }}
                options={filterList.cvList}
                value={filter.MeasuringObjectId}
                onChange={(val: any) => setFilter({ ...filter, MeasuringObjectId: val })}
                style={{ width: 240 }}
              />
            </Form.Item>
            <Form.Item label='CD执行器'>
              <Select
                fieldNames={{ label: 'Name', value: 'Id' }}
                options={filterList.mvList}
                value={filter.ActuatorId}
                onChange={(val: any) => setFilter({ ...filter, ActuatorId: val })}
                style={{ width: 240 }}
              />
            </Form.Item>
            <Form.Item label='控制模式'>
              <Input disabled value='CD' className='control-monitor__form-input--xl' />
            </Form.Item>
          </Form>
          <CDChartShow
            timeVisible
            slider={matchActChart?.AlignPositionNumber}
            sliderVisible={false}
            chartData={posData.MeasuringObject}
            chartOption={measureChart}
            chartHeight={340}
            seriesData={measureSeries}
          />
        </CollpaseZone>
        {/** CD 执行器对齐图表 */}
        <CollpaseZone
          showHandler={false}
          visible={visible}
          collapse={
            <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Form.Item label='位号'>
                <InputNumber
                  value={slider}
                  onChange={setSlider}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='对齐测量值'>
                <InputNumber
                  disabled
                  value={matchActChart?.AlignValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='当前SP'>
                <InputNumber
                  disabled
                  value={matchActChart?.SPValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='手动设定SP'>
                <InputNumber
                  value={matchActChart?.SetSPValue}
                  onChange={handleSetSPValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='当前PV'>
                <InputNumber
                  disabled
                  value={matchActChart?.PVValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='最大值'>
                <InputNumber
                  disabled
                  value={posData.Actuator.MaxValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='最小值'>
                <InputNumber
                  disabled
                  value={posData.Actuator.MinValue}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='坐标上界'>
                <InputNumber
                  disabled
                  value={posData.Actuator.CoordinateMax}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='坐标下界'>
                <InputNumber
                  disabled
                  value={posData.Actuator.CoordinateMin}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='2σ'>
                <InputNumber
                  disabled
                  value={posData.Actuator.TwoSigma}
                  className='control-monitor__form-input'
                />
              </Form.Item>
            </Form>
          }
          zoneStyle={{ top: -1 }}
          zoneRightClass='border-top pd-t12'
        >
          <CDChartShow
            checkboxVisible
            slider={slider}
            chartData={chartActuator}
            alignChartData={posData.MeasuringObject}
            chartOption={actChart}
            chartHeight={310}
            seriesData={actSeries}
            onChange={setSlider}
            onChartChange={setMatchChartData}
            onCheckedChange={setCheckedKeys}
          />
          <div className='control-monitor__btn-group'>
            <Button icon={<EnergyIcon type='icon-bihuanchuzhi' className='pd-r8' />} onClick={() => handleLoop(true, 'checked')}>选中闭环</Button>
            <Button icon={<EnergyIcon type='icon-kaihuan' className='pd-r8' />} onClick={() => handleLoop(false, 'checked')}>选中开环</Button>
            <Button type='primary' icon={<EnergyIcon type='icon-xieru' className='pd-r8' />} onClick={handleWrite}>写入</Button>
            <EasyModal
              title='SP值导入'
              width='400px'
              slot={<Button type='primary' icon={<ImportOutlined />}>导入</Button>}
              slotClass='mg-l18 mg-r18'
            >
              <SPValueImport
                controlId={controlId}
                actuatorId={filter.ActuatorId}
                onSuccess={getControlDetail}
              />
            </EasyModal>
            <Button type='primary' icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
            <Button type='primary' icon={<CameraOutlined />} onClick={handleActSnapshot}>快照</Button>
            <div className='control-monitor__btn-group--full'>
              <Button onClick={() => handleLoop(true, 'all')}>全闭环</Button>
              <Button onClick={() => handleLoop(false, 'all')}>全开环</Button>
            </div>
          </div>
        </CollpaseZone>
        {/** 通讯状态 */}
        <div className='control-monitor__footer'>
          <div className='control-monitor__footer-left'>
            {
              group.IsOnline
                ? <div className='display-flex'><i className='status fine' /><span>正常</span></div>
                : <div className='display-flex'><i className='status error' /><span>异常</span></div>
            }
            <NowTime extraFont='当前时间：' className='mg-l30' />
            <span className='mg-l30'>用户名：{commonStore.userinfo.NAME}</span>
            <span className='mg-l30'>用户类型：高级工程师</span>
          </div>
          <div className='control-monitor__footer-right'>
            <span>当前组剩余时间：{groupLeftTime}</span>
            <span className='mg-l30'>目标组切换时间：{group.TargetGroupChangeTime}</span>
            <CountTime
              extraFont='组切换倒计时：'
              // 与 counter 区分开，因为 setCounter 会一直刷新 counter
              seconds={countTime}
              onCountChange={setCounter}
              onCountDone={handleSwitchCountDone}
              className='mg-l30'
            />
          </div>
        </div>
      </div>
      <Loading loading={groupChanging} />
    </React.Fragment>
  )
}

export default observer(ControlMonitor)