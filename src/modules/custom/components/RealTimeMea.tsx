import { useState, useEffect, useMemo } from 'react'
import { Form, InputNumber } from 'antd'
import { CollpaseZone } from 'src/components'
import { CDChartShow } from '.'
import { $api, $consts, $evt } from 'src/plugins'
import { dashLine_bcbcbc } from 'src/assets/base64'

interface Props {
  filter: any,
  controlId: string | number
}
const RealTimeMea = (props: Props) => {
  // 总的图表数据
  const [charts, setCharts] = useState<any>({ actCharts: [], measureChart: {} })
  const getCharts = () => {
    if (props.filter) {
      const { ActuatorId, MeasuringObjectId } = props.filter
      const funcs = []
      ActuatorId.length ? funcs.push(
        $api['datapreview/getRealTimeDataByCV']({
          ControllerId: props.controlId,
          MeasuringObjectId: MeasuringObjectId[0],
          ActuatorIds: ActuatorId
        })
      ) : funcs.push(Promise.resolve([]))
      MeasuringObjectId.length ? funcs.push(
        $api['datapreview/getMeasuringObjectRealTimeData']({
          ControllerId: props.controlId,
          MeasuringObjectId: MeasuringObjectId[0]
        })
      ) : funcs.push(Promise.resolve({}))
      Promise.all(funcs).then((datas: any[]) => {
        const [actCharts = [], measureChart = {}] = datas
        setCharts({ actCharts, measureChart })
      })
    }
  }
  useEffect(() => {
    getCharts()
  }, [props.controlId, props.filter])

  // Slider 对应图表数据
  const [slider, setSlider] = useState(0)
  const [matchMeaChart, setMatchChartData] = useState<any>()
  const matchActCharts = useMemo(() => {
    const matchCharts: any = []
    charts.actCharts.forEach((chart: any) => {
      const { PositionNumbers = [] } = chart
      const find = PositionNumbers.find((item: any) => item.AlignPositionNumber === matchMeaChart?.PositionNumber)
      matchCharts.push(find)
    })
    return matchCharts
  }, [charts, matchMeaChart])

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
    const { PositionNumbers = [] } = charts.measureChart
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
  }, [charts.measureChart])

  // 执行器图表 series 数据
  const getActSeries = (chartData: any) => {
    const { PositionNumbers = [] } = chartData
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
      }
    ]
  }

  // 执行器图表配置
  const getActChart = (chartData: any) => {
    const { PositionNumbers = [] } = chartData
    const maxInterval = Math.ceil(PositionNumbers.length / 50)
    return {
      legend: { show: false },
      xAxis: { maxInterval, axisTick: { show: false } },
      yAxis: { name: '' }
    }
  }

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
            <Form.Item label='当前值'>
              <InputNumber
                disabled
                value={matchMeaChart?.PVValue}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='目标值'>
              <InputNumber
                disabled
                value={matchMeaChart?.SPValue}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='2σ'>
              <InputNumber
                disabled
                value={charts.measureChart.TwoSigma}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='YMax'>
              <InputNumber
                disabled
                value={charts.measureChart.YMax}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='YMin'>
              <InputNumber
                disabled
                value={charts.measureChart.YMin}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='Y平均'>
              <InputNumber
                disabled
                value={charts.measureChart.YAvg}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='坐标上界'>
              <InputNumber
                disabled
                value={charts.measureChart.CoordinateMax}
                className='data-preview__form-input'
              />
            </Form.Item>
            <Form.Item label='坐标下界'>
              <InputNumber
                disabled
                value={charts.measureChart.CoordinateMin}
                className='data-preview__form-input'
              />
            </Form.Item>
          </Form>
        }
        onChange={setVisible}
      >
        <CDChartShow
          timeVisible
          slider={slider}
          chartData={charts.measureChart}
          chartOption={measureChart}
          chartHeight={340}
          seriesData={measureSeries}
          onChange={setSlider}
          onChartChange={setMatchChartData}
        />
      </CollpaseZone>
      {
        charts.actCharts.map((chart: any, index: number) => {
          const matchChart = matchActCharts[index]
          const chartOption = getActChart(chart)
          const chartSeries = getActSeries(chart)
          return (
            <CollpaseZone
              key={`mea-realtime__chart-${index}`}
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
                  <Form.Item label='当前SP'>
                    <InputNumber
                      disabled
                      value={matchChart?.SPValue}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='当前PV'>
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
                  <Form.Item label='UMax'>
                    <InputNumber
                      disabled
                      value={chart.UMax}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='UMin'>
                    <InputNumber
                      disabled
                      value={chart.UMin}
                      className='data-preview__form-input'
                    />
                  </Form.Item>
                  <Form.Item label='U平均'>
                    <InputNumber
                      disabled
                      value={chart.UAvg}
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
                chartData={chart}
                alignChartData={charts.measureChart}
                chartOption={Object.assign(chartOption, { title: { text: chart.Name } })}
                chartHeight={330}
                seriesData={chartSeries}
                onAlignChange={setSlider}
              />
            </CollpaseZone>
          )
        })
      }
    </div>
  )
}

export default RealTimeMea