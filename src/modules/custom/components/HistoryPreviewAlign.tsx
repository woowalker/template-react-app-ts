import { useMemo } from 'react'
import { Form, Input, InputNumber } from 'antd'
import { CollpaseZone } from 'src/components'
import { CDChartShow, TimeChartShow } from '.'
import { $consts } from 'src/plugins'
import { omit, cloneDeep } from 'lodash'

interface CMDProps {
  previewType: string,
  chart: any,
  matchChart: any
}
// 对齐图 MD 预览：执行器和测量对象当前位号在所选时间段内的详细图表
const AlignMDPreview = (props: CMDProps) => {
  const mainChart = useMemo(() => {
    const { previewType, chart, matchChart } = props
    const { xAxis = {}, yAxis = [] } = matchChart

    const chartData = cloneDeep(chart)
    chartData.Data.forEach((item: any) => {
      const target = item.P.find((p: any) => p[0] === yAxis[0])
      item.Time = item.T
      item.Value = target ? (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'] ? target[3] : target[2]) : 0
    })
    const target = {
      xAxis,
      yAxis,
      chartData,
      series: [
        {
          field: 'Value',
          chartOption: {
            lineOption: {
              name: '当前值'
            }
          }
        }
      ],
      option: {
        title: { text: chartData.Name },
        legend: { show: false },
        yAxis: { name: '' },
      }
    }

    if (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
      return {
        ...target,
        maxText: 'YMax',
        minText: 'YMin'
      }
    }
    return {
      ...target,
      maxText: 'UMax',
      minText: 'UMin'
    }
  }, [props.previewType, props.chart, props.matchChart])

  return (
    <CollpaseZone
      collapse={
        <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
          <Form.Item label='对齐位号'>
            <Input
              disabled
              value={mainChart.yAxis[0]}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='SP'>
            <InputNumber
              disabled
              value={mainChart.yAxis[2]}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='PV'>
            <InputNumber
              disabled
              value={mainChart.yAxis[3]}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label={mainChart.maxText}>
            <InputNumber
              disabled
              value={mainChart.xAxis.A}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label={mainChart?.minText}>
            <InputNumber
              disabled
              value={mainChart.xAxis.I}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='坐标上界'>
            <InputNumber
              disabled
              value={mainChart.chartData.CoordinateMax}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='坐标下界'>
            <InputNumber
              disabled
              value={mainChart.chartData.CoordinateMin}
              className='data-preview__form-input'
            />
          </Form.Item>
        </Form>
      }
      zoneRightClass='pd-t12'
    >
      <TimeChartShow
        sliderVisible={false}
        chartData={mainChart.chartData}
        chartOption={mainChart.option}
        chartHeight={452}
        seriesData={mainChart.series}
      />
    </CollpaseZone>
  )
}

// 对齐图 CD 预览：执行器和测量对象所有位号在当前时间的详细图表
const AlignCDPreview = (props: CMDProps) => {
  const mainChart = useMemo(() => {
    const { previewType, chart, matchChart } = props
    const { xAxis = {}, yAxis = [] } = matchChart

    const chartData: any = omit(chart, ['Data'])
    chartData.PositionNumbers = xAxis.P?.map((p: any) => {
      return {
        PositionNumber: p[0],
        SPValue: p[2],
        PVValue: p[3]
      }
    }) || []

    const target = {
      xAxis,
      yAxis,
      chartData
    }

    if (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
      return {
        ...target,
        series: [
          {
            field: 'PVValue',
            chartOption: {
              legend: { data: [{ icon: 'circle' }] },
              lineOption: {
                name: 'PV值'
              }
            }
          }
        ],
        option: {
          title: { text: chartData.Name },
          legend: { show: false },
          yAxis: { name: '' }
        },
        maxText: 'YMax',
        minText: 'YMin'
      }
    }

    return {
      ...target,
      series: [
        {
          field: 'SPValue',
          chartOption: {
            barOption: {
              name: 'SP值'
            }
          }
        }
      ],
      option: {
        title: { text: chartData.Name },
        legend: { show: false },
        xAxis: { maxInterval: 1, axisTick: { show: false } },
        yAxis: { name: '' }
      },
      maxText: 'UMax',
      minText: 'UMin'
    }
  }, [props.previewType, props.chart, props.matchChart])

  return (
    <CollpaseZone
      collapse={
        <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
          <Form.Item label='当前时间'>
            <Input
              disabled
              value={mainChart.xAxis.T}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='SP'>
            <InputNumber
              disabled
              value={mainChart.yAxis[2]}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='PV'>
            <InputNumber
              disabled
              value={mainChart.yAxis[3]}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label={mainChart.maxText}>
            <InputNumber
              disabled
              value={mainChart.xAxis.A}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label={mainChart?.minText}>
            <InputNumber
              disabled
              value={mainChart.xAxis.I}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='坐标上界'>
            <InputNumber
              disabled
              value={mainChart.chartData.CoordinateMax}
              className='data-preview__form-input mg-b26'
            />
          </Form.Item>
          <Form.Item label='坐标下界'>
            <InputNumber
              disabled
              value={mainChart.chartData.CoordinateMin}
              className='data-preview__form-input'
            />
          </Form.Item>
        </Form>
      }
      zoneRightClass='pd-t12'
    >
      <CDChartShow
        sliderVisible={false}
        chartData={mainChart.chartData}
        chartOption={mainChart.option}
        chartHeight={452}
        seriesData={mainChart.series}
      />
    </CollpaseZone>
  )
}

interface Props extends CMDProps {
  preview: string
}
// 对齐图预览 执行器/测量对象
const HistoryPreviewAlign = (props: Props) => {
  const { previewType, preview, chart, matchChart } = props
  return (
    <div className='data-preview__chart-preview'>
      {
        preview === $consts['DATAPREVIEW/PREVIEW_TYPE_CD']
          ? <AlignCDPreview previewType={previewType} chart={chart} matchChart={matchChart} />
          : <AlignMDPreview previewType={previewType} chart={chart} matchChart={matchChart} />
      }
    </div>
  )
}

export default HistoryPreviewAlign