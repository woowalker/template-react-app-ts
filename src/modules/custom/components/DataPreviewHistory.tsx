import { useState, useEffect, useMemo } from 'react'
import { Form, Input, InputNumber } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { CollpaseZone } from 'src/components'
import { HistoryPreviewMain, HistoryPreviewAlign } from '.'
import HistoryChartShow, { SliderProps } from './HistoryChartShow'
import { $api, $consts, $evt } from 'src/plugins'
import moment from 'moment'

type Props = {
  chartType: string,
  chart: any,
  matchChart: any,
  slider: SliderProps,
  sliderDisabled?: boolean,
  range?: any,
  onSliderChange?: Function
}
const MatchChartOptions = (props: Props) => {
  const { chartType, chart = {}, matchChart = {}, slider, range = {} } = props
  const { xAxis, yAxis } = slider
  const { yAxis: yAxisRange } = range
  const { xAxis: xAxisChart = {}, yAxis: yAxisChart = [] } = matchChart
  const { S, A, I } = xAxisChart
  const unit = chartType === 'actCharts' ? 'U' : 'Y'

  return (
    <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
      <Form.Item label='时间'>
        <Input
          readOnly
          value={xAxis}
          suffix={<ClockCircleOutlined />}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='2σ'>
        <InputNumber
          disabled
          value={S}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label={`${unit}Max`}>
        <InputNumber
          disabled
          value={A}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label={`${unit}Min`}>
        <InputNumber
          disabled
          value={I}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='位号'>
        <InputNumber
          disabled={props.sliderDisabled}
          value={yAxis}
          {...yAxisRange}
          onChange={val => props.onSliderChange instanceof Function && props.onSliderChange(val)}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='目标值'>
        <InputNumber
          disabled
          value={yAxisChart[2]}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='当前值'>
        <InputNumber
          disabled
          value={yAxisChart[3]}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='上界'>
        <InputNumber
          disabled
          value={yAxisChart[4]}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='下界'>
        <InputNumber
          disabled
          value={yAxisChart[5]}
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
  )
}

type HisProps = {
  previewType: string,
  filter: any,
  controlId: string | number,
  timeRange: any[]
}

const DataPreviewHistory = (props: HisProps) => {
  // 执行器、测量对象请求参数
  const request = useMemo(() => {
    if (!props.filter) return

    const { previewType, controlId: ControllerId, filter, timeRange } = props
    const { ActuatorId, MeasuringObjectId } = filter
    // 执行器预览
    if (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
      return {
        urls: ['datapreview/getActuatorHistoryData', 'datapreview/getHistoryDataByMV'],
        payload: {
          ControllerId,
          ActuatorId: ActuatorId[0],
          MeasuringObjectIds: MeasuringObjectId,
          StartTime: moment(timeRange[0]).format('YYYY-MM-DD HH:mm:ss'),
          EndTime: moment(timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
        },
        dataChartsField: 'Actuator'
      }
    }
    // 测量对象预览
    return {
      urls: ['datapreview/getMeasuringObjectHistoryData', 'datapreview/getHistoryDataByCV'],
      payload: {
        ControllerId,
        ActuatorIds: ActuatorId,
        MeasuringObjectId: MeasuringObjectId[0],
        StartTime: moment(timeRange[0]).format('YYYY-MM-DD HH:mm:ss'),
        EndTime: moment(timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
      },
      dataChartsField: 'MeasuringObject'
    }
  }, [props.previewType, props.controlId, props.filter, props.timeRange])

  // 总的图表数据
  const [charts, setCharts] = useState<any>({
    actCharts: [],
    meaCharts: [],
    previewType: $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'],
    mainField: 'actCharts',
    alignField: 'meaCharts'
  })
  const getCharts = () => {
    if (request) {
      Promise.all(request.urls.map((url: string) => $api[url](request.payload))).then((datas: any[]) => {
        if (request.dataChartsField === 'Actuator') {
          const actCharts = [].concat(datas[0] ? datas[0][request.dataChartsField] : [])
          const meaCharts = [].concat(datas[1] || [])
          setCharts({
            actCharts,
            meaCharts,
            previewType: $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'],
            mainField: 'actCharts',
            alignField: 'meaCharts'
          })
        } else {
          const actCharts = [].concat(datas[1] || [])
          const meaCharts = [].concat(datas[0] ? datas[0][request.dataChartsField] : [])
          setCharts({
            actCharts,
            meaCharts,
            previewType: $consts['DATAPREVIEW/PREVIEW_TYPE_MEASURE'],
            mainField: 'meaCharts',
            alignField: 'actCharts'
          })
        }
      })
    }
  }
  useEffect(() => {
    getCharts()
  }, [request])

  // Slider 对应图表数据
  const [slider, setSlider] = useState<SliderProps>({ xAxis: '', yAxis: 0 })
  const [range, setRange] = useState({ yAxis: { min: 0, max: 100 } })
  const [matchChart, setMatchChart] = useState({ main: {}, align: [] })

  // 监听CDM预览事件
  const [preview, setPreview] = useState('')
  useEffect(() => {
    const handlePreview = (type: string) => {
      setPreview(type)
    }
    $evt.addListener($consts['DATAPREVIEW/EVT_CMDPREVIEW'], handlePreview)

    return () => {
      $evt.removeListener($consts['DATAPREVIEW/EVT_CMDPREVIEW'], handlePreview)
    }
  }, [])

  // options 展开收起
  const [visible, setVisible] = useState(false)

  return (
    <div className='pd-b36'>
      {
        charts[charts.mainField].map((chart: any, index: number) => {
          return (
            <CollpaseZone
              key={`his-main__chart-${index}`}
              collapse={
                <MatchChartOptions
                  chartType={charts.mainField}
                  chart={chart}
                  matchChart={matchChart.main}
                  slider={slider}
                  range={range}
                  onSliderChange={(val: number) => setSlider({ ...slider, yAxis: val })}
                />
              }
              onChange={setVisible}
            >
              <HistoryChartShow
                slider={slider}
                chartData={chart}
                alignChartData={charts[charts.alignField]}
                chartOption={{ legend: { show: false }, yAxis: { name: '' }, title: { text: chart?.Name } }}
                chartHeight={420}
                seriesData={[{ fieldIndex: 2, chartOption: { progressive: 0 } }]}
                onChange={setSlider}
                onRangeChange={setRange}
                onChartChange={setMatchChart}
              />
              {
                preview ?
                  (
                    <HistoryPreviewMain
                      previewType={charts.previewType}
                      preview={preview}
                      chart={chart}
                      matchChart={matchChart.main}
                    />
                  )
                  : null
              }
            </CollpaseZone>
          )
        })
      }
      {
        charts[charts.alignField].map((chart: any, index: number) => {
          const matchAlign: any = matchChart.align[index]
          const matchSlider = { ...slider, yAxis: matchAlign && matchAlign.yAxis ? matchAlign.yAxis[0] : 0 }
          return (
            <CollpaseZone
              key={`his-align__chart-${index}`}
              showHandler={false}
              visible={visible}
              collapse={
                <MatchChartOptions
                  sliderDisabled
                  chartType={charts.alignField}
                  chart={chart}
                  matchChart={matchAlign}
                  slider={matchSlider}
                />
              }
              zoneClass='border-top'
              zoneRightClass='pd-t12'
            >
              <HistoryChartShow
                sliderVisible={false}
                slider={matchSlider}
                chartData={chart}
                chartOption={{ legend: { show: false }, yAxis: { name: '' }, title: { text: chart?.Name } }}
                chartHeight={452}
                seriesData={[{ fieldIndex: 3, chartOption: { progressive: 0 } }]}
              />
              {
                preview
                  ? (
                    <HistoryPreviewAlign
                      previewType={charts.previewType}
                      preview={preview}
                      chart={chart}
                      matchChart={matchAlign}
                    />
                  )
                  : null
              }
            </CollpaseZone>
          )
        })
      }
    </div>
  )
}

export default DataPreviewHistory