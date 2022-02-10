import { useState, useEffect, useMemo } from 'react'
import { Form, Input, InputNumber } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { CollpaseZone } from 'src/components'
import { TimeChartShow } from '.'
import { $api, $consts } from 'src/plugins'
import moment from 'moment'

type Props = {
  slider: string,
  chart: any,
  matchChart?: any
}
const MatchChartOptions = (props: Props) => {
  return (
    <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
      <Form.Item label='时间'>
        <Input
          readOnly
          value={props.slider}
          suffix={<ClockCircleOutlined />}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='当前值'>
        <InputNumber
          disabled
          value={props.matchChart?.Value}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='Max'>
        <InputNumber
          disabled
          value={props.chart.Max}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='Min'>
        <InputNumber
          disabled
          value={props.chart.Min}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='Avg'>
        <InputNumber
          disabled
          value={props.chart.Avg}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='坐标上界'>
        <InputNumber
          disabled
          value={props.chart.CoordinateMax}
          className='data-preview__form-input'
        />
      </Form.Item>
      <Form.Item label='坐标下界'>
        <InputNumber
          disabled
          value={props.chart.CoordinateMin}
          className='data-preview__form-input'
        />
      </Form.Item>
    </Form>
  )
}

export type AvgProps = {
  previewType: string,
  filter: any,
  controlId: string | number,
  timeRange: any[],
  isSigma?: boolean
}

const series = [
  {
    field: 'Value',
    chartOption: {
      lineOption: {
        name: '当前值'
      }
    }
  }
]
const DataPreviewAvg = (props: AvgProps) => {
  // 执行器、测量对象请求参数
  const request = useMemo(() => {
    if (!props.filter) return

    const { previewType, controlId: ControllerId, filter, timeRange } = props
    const { ActuatorId, MeasuringObjectId } = filter
    // 执行器预览
    if (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
      return {
        url: 'datapreview/getAvgOrSigmaDataByMV',
        payload: {
          Type: props.isSigma ? 2 : 1,
          ControllerId,
          ActuatorId: ActuatorId[0],
          MeasuringObjectIds: MeasuringObjectId,
          StartTime: moment(timeRange[0]).format('YYYY-MM-DD HH:mm:ss'),
          EndTime: moment(timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
        },
        actChartsField: 'Actuator',
        meaChartsField: 'MeasuringObjects',
        mainChartField: 'actCharts',
        alignChartsField: 'meaCharts'
      }
    }
    // 测量对象预览
    return {
      url: 'datapreview/getAvgOrSigmaDataByCV',
      payload: {
        Type: props.isSigma ? 2 : 1,
        ControllerId,
        ActuatorIds: ActuatorId,
        MeasuringObjectId: MeasuringObjectId[0],
        StartTime: moment(timeRange[0]).format('YYYY-MM-DD HH:mm:ss'),
        EndTime: moment(timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
      },
      actChartsField: 'Actuators',
      meaChartsField: 'MeasuringObject',
      mainChartField: 'meaCharts',
      alignChartsField: 'actCharts'
    }
  }, [props.previewType, props.controlId, props.filter, props.timeRange, props.isSigma])

  // 总的图表数据
  const [charts, setCharts] = useState<any>({ actCharts: [], meaCharts: [] })
  const getCharts = () => {
    if (request) {
      $api[request.url](request.payload).then((res: any) => {
        if (res) {
          const actCharts = [].concat(res[request.actChartsField])
          const meaCharts = [].concat(res[request.meaChartsField])
          setCharts({ actCharts, meaCharts })
        }
      })
    }
  }
  useEffect(() => {
    getCharts()
  }, [request])

  // Slider 对应图表数据
  const [slider, setSlider] = useState('')
  const [matchMainChart, setMatchMainChart] = useState<any>()
  const matchAlignCharts = useMemo(() => {
    const matchCharts: any = []
    const alignField = request?.alignChartsField || 'meaCharts'
    charts[alignField].forEach((chart: any) => {
      const { Data = [] } = chart
      const find = Data.find((item: any) => item.Time === matchMainChart?.Time)
      matchCharts.push(find)
    })
    return matchCharts
  }, [request, charts, matchMainChart])

  // options 展开收起
  const [visible, setVisible] = useState(false)

  const mainField = request?.mainChartField || 'actCharts'
  const alignField = request?.alignChartsField || 'meaCharts'
  return (
    <div className='pd-b36'>
      {
        charts[mainField].map((chart: any, index: number) => {
          return (
            <CollpaseZone
              key={`avg-main__chart-${index}`}
              collapse={<MatchChartOptions slider={slider} chart={chart} matchChart={matchMainChart} />}
              onChange={setVisible}
            >
              <TimeChartShow
                slider={slider}
                chartData={chart}
                chartOption={{ legend: { show: false }, yAxis: { name: '' }, title: { text: chart?.Name } }}
                chartHeight={260}
                seriesData={series}
                onChange={setSlider}
                onChartChange={setMatchMainChart}
              />
            </CollpaseZone>
          )
        })
      }
      {
        charts[alignField].map((chart: any, index: number) => {
          const matchChart = matchAlignCharts[index]
          return (
            <CollpaseZone
              key={`avg-align__chart-${index}`}
              showHandler={false}
              visible={visible}
              collapse={<MatchChartOptions slider={slider} chart={chart} matchChart={matchChart} />}
              zoneClass='border-top'
              zoneRightClass='pd-t12'
            >
              <TimeChartShow
                sliderVisible={false}
                slider={slider}
                chartData={chart}
                chartOption={{ legend: { show: false }, yAxis: { name: '' }, title: { text: chart?.Name } }}
                chartHeight={291}
                seriesData={series}
              />
            </CollpaseZone>
          )
        })
      }
    </div>
  )
}

export default DataPreviewAvg