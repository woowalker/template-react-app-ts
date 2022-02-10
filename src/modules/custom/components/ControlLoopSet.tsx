import React, { useState, useEffect, useMemo, useRef } from 'react'
import { autorun } from 'mobx'
import { Form, Select, InputNumber, Tabs, Button, Modal, message } from 'antd'
import { CameraOutlined } from '@ant-design/icons'
import { EnergyIcon, CollpaseZone } from 'src/components'
import { CDChartShow } from './'
import { noticeStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { uuid } from 'src/utils/tools'
import { cloneDeep } from 'lodash'

const { TabPane } = Tabs

type Props = {
  onSuccess: Function
}
const ControlLoopSet = (props: Props) => {
  // 弹框
  const [visible, setVisible] = useState(false)

  // 控制器
  const messageId = useRef<string>('')
  const [controllerId, setControllerId] = useState<string>()
  useEffect(() => {
    const dispose = autorun(() => {
      const { Id = '', RelateId, TypeCode } = noticeStore.activeNotice || {}
      if (TypeCode === $consts['SOCKET/LOOP_LIST']) {
        messageId.current = Id
        setControllerId(RelateId)
        setVisible(true)
      }
    })
    return dispose
  }, [])

  // 所有执行器
  const [mvList, setMVList] = useState<any>([])
  useEffect(() => {
    if (controllerId) {
      $api['controlmonitor/getActuatorByWrite']({
        ControllerId: controllerId
      }).then((res: any) => {
        res && setMVList(res)
      })
    }
  }, [controllerId])

  // 测量对象与执行器过滤
  const [filter, setFilter] = useState({ MeasuringObjectId: '', ActuatorId: '' })
  useEffect(() => {
    const initFilter = { MeasuringObjectId: '', ActuatorId: '' }
    mvList[0]?.Id && (initFilter.ActuatorId = mvList[0].Id)
    mvList[0]?.CVList && mvList[0]?.CVList[0]?.Id && (initFilter.MeasuringObjectId = mvList[0].CVList[0].Id)
    setFilter(initFilter)
  }, [mvList])

  const missFilterId = (show?: boolean): boolean => {
    const { MeasuringObjectId, ActuatorId } = filter
    !MeasuringObjectId && show && message.error('请选择测量对象')
    !ActuatorId && show && message.error('请选择执行器')
    return !MeasuringObjectId || !ActuatorId
  }

  const cvList = useMemo(() => {
    const find: any = mvList.find((item: any) => item.Id === filter.ActuatorId)
    return find?.CVList || []
  }, [mvList, filter])

  // 控制器位号数据
  const [uniqueKey, setUniqueKey] = useState(uuid())
  const [posData, setPosData] = useState<any>({ MeasuringObject: {}, Actuator: {} })
  const getPosData = () => {
    if (missFilterId()) return

    $api['controlmonitor/getPositionData']({
      ControllerId: controllerId,
      ...filter
    }).then((res: any) => {
      if (res) {
        setPosData(res)
        setUniqueKey(uuid())
      }
    })
  }
  useEffect(() => {
    getPosData()
  }, [controllerId, filter])

  // Slider 对应图表数据
  const [slider, setSlider] = useState(0)
  const [matchActChart, setMatchChartData] = useState<any>()
  const matchMeasureChart = useMemo(() => {
    const { PositionNumbers = [] } = posData.MeasuringObject
    return PositionNumbers.find((item: any) => item.PositionNumber === matchActChart?.AlignPositionNumber)
  }, [posData, matchActChart])

  // options 展开收起
  const [optionShow, setOptionShow] = useState(false)

  // 测量对象快照
  const handleMeasureSnapshot = () => {
    if (missFilterId(true)) return

    $api['controlmonitor/saveMeasuringObjectSnapshot']({
      Id: filter.MeasuringObjectId
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        getPosData()
      }
    })
  }

  // 手动设定 SP
  const handleSetWriteSP = (val: number) => {
    const copyActuator = cloneDeep(posData.Actuator)
    const { PositionNumbers = [] } = copyActuator
    const find: any = PositionNumbers.find((item: any) => item.PositionNumber === slider)
    if (find) {
      find.WriteSP = val
      setPosData({ ...posData, Actuator: copyActuator })
    }
  }

  // 关闭当前 Tab
  const disposeCurrTab = () => {
    if (mvList.length <= 1) {
      setVisible(false)
      return
    }
    setMVList(mvList.filter((item: any) => item.Id !== filter.ActuatorId))
  }

  // 恢复当前位号
  const handleResetCurr = () => {
    const copyActuator = cloneDeep(posData.Actuator)
    const { PositionNumbers = [] } = copyActuator
    const find: any = PositionNumbers.find((item: any) => item.PositionNumber === slider)
    if (find) {
      find.WriteSP = find.AlgorithmicSP
      setPosData({ ...posData, Actuator: copyActuator })
    }
  }

  // 恢复所有位号
  const handleResetAll = () => {
    const copyActuator = cloneDeep(posData.Actuator)
    const { PositionNumbers = [] } = copyActuator
    PositionNumbers.forEach((item: any) => {
      item.WriteSP = item.AlgorithmicSP
    })
    setPosData({ ...posData, Actuator: copyActuator })
  }

  // 写入
  const handleWriteSP = () => {
    const { PositionNumbers = [] } = posData.Actuator

    $api['controlmonitor/writeSemiClosedLoopData']({
      ControllerId: controllerId,
      ActuatorData: [
        {
          ActuatorId: filter.ActuatorId,
          PositionNumbers: PositionNumbers.map((item: any) => ({ PositionNumber: item.PositionNumber, SPValue: item.WriteSP }))
        }
      ]
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        props.onSuccess($consts['SOCKET/LOOP_READ'], messageId.current, true)
        disposeCurrTab()
      }
    })
  }

  // 放弃
  const handleDropSP = () => {
    $api['controlmonitor/giveUpSemiClosedLoopData']({
      ControllerId: controllerId,
      ...filter
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        props.onSuccess($consts['SOCKET/LOOP_READ'], messageId.current, true)
        disposeCurrTab()
      }
    })
  }

  // 测量对象图表 series 数据
  const measureSeries = [
    {
      field: 'PVValue',
      chartOption: {
        lineOption: {
          name: '当前值',
        }
      },
    },
    {
      field: 'SnapPVValue',
      chartOption: {
        lineOption: {
          name: '快照值',
        }
      },
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
    const { PositionNumbers = [] } = posData.Actuator
    const barMaxWidth = 13 - Math.floor(PositionNumbers.length / 50) * 2
    return [
      {
        field: 'SPValue',
        zeroToUndefined: true, // 0 值不画
        chartOption: {
          legend: { data: [{ icon: 'circle' }] },
          lineOption: {
            name: '当前SP',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { opacity: 0 },
            areaStyle: { color: 'rgba(0,0,0,0)' }
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
      },
      {
        field: 'WriteSP',
        chartOption: {
          barOption: {
            name: '新SP值',
            barMaxWidth
          }
        }
      }
    ]
  }, [posData.Actuator])

  // 执行器图表配置
  const actChart = useMemo(() => {
    const { PositionNumbers = [] } = posData.Actuator
    const maxInterval = Math.ceil(PositionNumbers.length / 50)
    return {
      title: { show: false },
      legend: { itemWidth: 24, itemHeight: 12 },
      xAxis: { maxInterval, axisTick: { show: false } }
    }
  }, [posData.Actuator])

  return (
    <Modal
      destroyOnClose
      width='98%'
      title='请处理'
      footer={null}
      visible={visible}
      onCancel={() => setVisible(false)}
    >
      <Tabs type='card' onChange={val => setFilter({ ...filter, ActuatorId: val })}>
        {mvList.map((pane: any, index: number) => <TabPane tab={pane.Name} key={`${pane.Id}_${index}`} />)}
      </Tabs>
      <div className='control-monitor loop-set'>
        <Select
          fieldNames={{ label: 'Name', value: 'Id' }}
          options={cvList}
          value={filter.MeasuringObjectId}
          onChange={(val: any) => setFilter({ ...filter, MeasuringObjectId: val })}
          className='control-monitor__select'
        />
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
                    value={matchMeasureChart?.TwoSigma}
                    className='control-monitor__form-input'
                  />
                </Form.Item>
              </Form>
              <div className='mg-t20 pd-l16 pd-r10 text-center'>
                <Button block type='primary' icon={<CameraOutlined />} onClick={handleMeasureSnapshot}>快照</Button>
              </div>
            </React.Fragment>
          }
          onChange={setOptionShow}
          zoneRightClass='pd-t12'
        >
          <CDChartShow
            timeVisible
            slider={matchActChart?.AlignPositionNumber}
            sliderVisible={false}
            chartData={posData.MeasuringObject}
            chartOption={measureChart}
            chartHeight={298}
            seriesData={measureSeries}
          />
        </CollpaseZone>
        {/** CD 执行器对齐图表 */}
        <CollpaseZone
          showHandler={false}
          visible={optionShow}
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
              <Form.Item label='算法输出SP'>
                <InputNumber
                  disabled
                  value={matchActChart?.AlgorithmicSP}
                  className='control-monitor__form-input'
                />
              </Form.Item>
              <Form.Item label='回写输出SP'>
                <InputNumber
                  value={matchActChart?.WriteSP}
                  onChange={handleSetWriteSP}
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
              <Form.Item label='当前PV'>
                <InputNumber
                  disabled
                  value={matchActChart?.PVValue}
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
            </Form>
          }
        >
          <CDChartShow
            key={uniqueKey}
            slider={slider}
            chartData={posData.Actuator}
            alignChartData={posData.MeasuringObject}
            chartOption={actChart}
            chartHeight={320}
            seriesData={actSeries}
            onChange={setSlider}
            onChartChange={setMatchChartData}
          />
        </CollpaseZone>
        {/** 操作按钮 */}
        <div className='pd-t12 text-right border-top'>
          <Button onClick={handleResetCurr} type='primary' icon={<EnergyIcon type='icon-shujuhuifu' className='pd-r8' />} className='mg-l12'>恢复当前位号</Button>
          <Button onClick={handleResetAll} type='primary' icon={<EnergyIcon type='icon-shujuhuifu' className='pd-r8' />} className='mg-l12'>恢复全部</Button>
          <Button onClick={handleWriteSP} type='primary' icon={<EnergyIcon type='icon-xieru' className='pd-r8' />} className='mg-l12'>写入</Button>
          <Button onClick={handleDropSP} type='primary' icon={<EnergyIcon type='icon-fangqiruzhi' className='pd-r8' />} className='mg-l12'>放弃</Button>
        </div>
      </div>
    </Modal>
  )
}

export default ControlLoopSet