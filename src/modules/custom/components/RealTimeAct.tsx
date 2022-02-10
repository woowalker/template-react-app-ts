import { useState, useEffect, useMemo } from 'react'
import { Form, InputNumber } from 'antd'
import { CollpaseZone } from 'src/components'
import { CDChartShow } from '.'
import { $api, $consts, $evt } from 'src/plugins'
import { cloneDeep } from 'lodash'

interface Props {
  filter: any,
  controlId: string | number
}
const RealTimeAct = (props: Props) => {
  // 总的图表数据
  const [charts, setCharts] = useState<any>({ actChart: {}, measureCharts: [] })
  const getCharts = () => {
    if (props.filter) {
      const { ActuatorId, MeasuringObjectId } = props.filter
      const funcs = []
      ActuatorId.length ? funcs.push(
        $api['datapreview/getActuatorRealTimeData']({
          ControllerId: props.controlId,
          ActuatorId: ActuatorId[0]
        })
      ) : funcs.push(Promise.resolve({}))
      MeasuringObjectId.length ? funcs.push(
        $api['datapreview/getRealTimeDataByMV']({
          ControllerId: props.controlId,
          ActuatorId: ActuatorId[0],
          MeasuringObjectIds: MeasuringObjectId
        })
      ) : funcs.push(Promise.resolve([]))
      Promise.all(funcs).then((datas: any[]) => {
        const [actChart = {}, measureCharts = []] = datas
        setCharts({ actChart, measureCharts })
      })
    }
  }
  useEffect(() => {
    getCharts()
  }, [props.controlId, props.filter])

  // 取位号数最大的测量对象图表作为被对齐图表
  const measureAlignChart = useMemo(() => {
    const { measureCharts } = charts
    if (!measureCharts.length) return {}
    let alignChart = measureCharts[0]
    for (let i = 1, j = measureCharts.length; i < j; i++) {
      const { PositionNumbers } = measureCharts[i]
      if (PositionNumbers.length > alignChart.PositionNumbers.length) {
        alignChart = measureCharts[i]
      }
    }
    return alignChart
  }, [charts])

  // 执行器图表对齐数据
  const actAlignChart = useMemo(() => {
    const { actChart } = cloneDeep(charts)
    const { PositionNumbers: actPoints = [] } = actChart
    const { PositionNumbers: meaPoints = [] } = measureAlignChart
    meaPoints.forEach((point: any) => {
      const find = actPoints.find((act: any) => act.PositionNumber === point.AlignPositionNumber)
      find && (find.AlignPositionNumber = point.PositionNumber)
    })
    return actChart
  }, [charts, measureAlignChart])

  // Slider 对应图表数据
  const [slider, setSlider] = useState(0)
  const [matchActChart, setMatchChartData] = useState<any>()
  const matchMeasureCharts = useMemo(() => {
    const matchCharts: any = []
    charts.measureCharts.forEach((chart: any) => {
      const { PositionNumbers = [] } = chart
      const find = PositionNumbers.find((item: any) => item.AlignPositionNumber === matchActChart?.PositionNumber)
      matchCharts.push(find)
    })
    return matchCharts
  }, [charts, matchActChart])

  // 将与执行器对齐的测量对象图表变更为与 measureAlignChart 对齐
  const getAlignChart = (chart: any) => {
    const { PositionNumbers: chartPoints = [] } = chart
    const { PositionNumbers: actPoints = [] } = actAlignChart
    chartPoints.forEach((point: any) => {
      const actFind = actPoints.find((act: any) => point.AlignPositionNumber === act.PositionNumber)
      if (!actFind) return
      point.AlignPositionNumber = actFind.AlignPositionNumber
    })
    return chart
  }

  // 监听快照事件
  useEffect(() => {
    $evt.addListener($consts['DATAPREVIEW/EVT_SNAPSHOT'], getCharts)

    return () => {
      $evt.removeListener($consts['DATAPREVIEW/EVT_SNAPSHOT'], getCharts)
    }
  }, [props.controlId, props.filter])

  // options 展开收起
  const [visible, setVisible] = useState(false)

  // 测量对象图表 series 数据
  const measureSeries = [
    {
      field: 'PVValue',
      chartOption: {
        lineOption: {
          name: '当前值',
        }
      }
    }
  ]

  // 测量对象图表配置
  const getMeasureChart = (chartData: any) => {
    const { PositionNumbers = [] } = chartData
    const PVValues = PositionNumbers.map((item: any) => item.PVValue).filter((item: number) => item)
    const max = Math.max(...PVValues)
    const min = Math.min(...PVValues)
    return {
      legend: { show: false },
      yAxis: { name: '' },
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
  }

  // 执行器图表 series 数据
  const actSeries = useMemo(() => {
    const { PositionNumbers = [] } = actAlignChart
    const barMaxWidth = 13 - Math.floor(PositionNumbers.length / 50) * 2
    return [
      {
        field: 'SPValue',
        chartOption: {
          barOption: {
            name: '当前值SP',
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
            name: '当前值PV',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { opacity: 0 },
            areaStyle: { color: 'rgba(0,0,0,0)' }
          },
        }
      },
      {
        field: 'SnapSPValue',
        chartOption: {
          legend: { data: [{ icon: 'path://M0 0 H150 V12 H0 Z' }] },
          lineOption: {
            name: '快照SP',
            areaStyle: { color: 'rgba(0,0,0,0)' }
          },
        }
      }
    ]
  }, [actAlignChart])

  // 执行器图表配置
  const actChart = useMemo(() => {
    const { PositionNumbers = [] } = actAlignChart
    const maxInterval = Math.ceil(PositionNumbers.length / 50)
    return {
      title: { show: false },
      xAxis: { maxInterval, axisTick: { show: false } }
    }
  }, [actAlignChart])

  return (
    <div className='pd-b36'>
      <CollpaseZone
        collapse={
          <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
            <Form.Item label='位号'>
              <InputNumber
                value={slider}
                onChange={setSlider}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='当前SP'>
              <InputNumber
                disabled
                value={matchActChart?.SPValue}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='当前PV'>
              <InputNumber
                disabled
                value={matchActChart?.PVValue}
                className='data-preview__form-input'
              />
            </Form.Item>
            {
              charts.measureCharts.map((chart: any, index: number) => {
                const matchChart = matchMeasureCharts[index]
                return (
                  <Form.Item key={`act-realtime__form-${index}`} label={`对齐Y${index + 1}`}>
                    <InputNumber
                      disabled
                      value={matchChart?.AlignValue}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                )
              })
            }
            <Form.Item label='2σ'>
              <InputNumber
                disabled
                value={charts.actChart.TwoSigma}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='UMax'>
              <InputNumber
                disabled
                value={charts.actChart.UMax}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='UMin'>
              <InputNumber
                disabled
                value={charts.actChart.UMin}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='U平均'>
              <InputNumber
                disabled
                value={charts.actChart.UAvg}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='坐标上界'>
              <InputNumber
                disabled
                value={charts.actChart.CoordinateMax}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='坐标下界'>
              <InputNumber
                disabled
                value={charts.actChart.CoordinateMin}
                className='data-preview__form-input'
              />
            </Form.Item>
          </Form>
        }
        onChange={setVisible}
      >
        <CDChartShow
          slider={slider}
          chartData={actAlignChart}
          alignChartData={measureAlignChart}
          chartOption={actChart}
          chartHeight={340 + charts.measureCharts.length * 40}
          seriesData={actSeries}
          onChange={setSlider}
          onChartChange={setMatchChartData}
        />
      </CollpaseZone>
      {
        charts.measureCharts.map((chart: any, index: number) => {
          const matchChart = matchMeasureCharts[index]
          const chartData = chart !== measureAlignChart ? getAlignChart(cloneDeep(chart)) : chart
          const alignChartData = chart !== measureAlignChart ? measureAlignChart : undefined
          const baseOption: any = {
            title: { text: `Y${index + 1}：${chart.Name}` }
          }
          !alignChartData && (baseOption.xAxis = { axisLabel: { showMinLabel: true, showMaxLabel: true } })
          const chartOption = Object.assign(baseOption, getMeasureChart(chartData))
          return (
            <CollpaseZone
              key={`act-realtime__chart-${index}`}
              showHandler={false}
              visible={visible}
              collapse={
                <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
                  <Form.Item label='对齐位号'>
                    <InputNumber
                      disabled
                      value={matchChart?.PositionNumber}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='当前值'>
                    <InputNumber
                      disabled
                      value={matchChart?.PVValue}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='2σ'>
                    <InputNumber
                      disabled
                      value={chart.TwoSigma}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='YMax'>
                    <InputNumber
                      disabled
                      value={chart.YMax}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='YMin'>
                    <InputNumber
                      disabled
                      value={chart.YMin}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='Y平均'>
                    <InputNumber
                      disabled
                      value={chart.YAvg}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='坐标上界'>
                    <InputNumber
                      disabled
                      value={chart.CoordinateMax}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='坐标下界'>
                    <InputNumber
                      disabled
                      value={chart.CoordinateMin}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                </Form>
              }
              zoneClass='border-top'
              zoneRightClass='pd-t12'
            >
              <CDChartShow
                slider={matchChart?.PositionNumber}
                sliderVisible={false}
                chartData={chartData}
                alignChartData={alignChartData}
                chartOption={chartOption}
                chartHeight={330}
                seriesData={measureSeries}
              />
            </CollpaseZone>
          )
        })
      }
    </div>
  )
}

export default RealTimeAct