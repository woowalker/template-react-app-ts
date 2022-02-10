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
// 主图 MD 预览：执行器和测量对象当前位号在所选时间段内的详细图表
const MainMDPreview = (props: CMDProps) => {
  const mainChart = useMemo(() => {
    const { previewType, chart, matchChart } = props
    const { xAxis = {}, yAxis = [] } = matchChart

    const chartData = cloneDeep(chart)
    chartData.Data.forEach((item: any) => {
      const target = item.P.find((p: any) => p[0] === yAxis[0])
      item.Time = item.T
      item.Value = target ? (previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR'] ? target[2] : target[3]) : 0
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
        maxText: 'UMax',
        minText: 'UMin'
      }
    }
    return {
      ...target,
      maxText: 'YMax',
      minText: 'YMin'
    }
  }, [props.previewType, props.chart, props.matchChart])

  return (
    <CollpaseZone
      collapse={
        <Form layout='horizontal' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
          <Form.Item label='位号'>
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
        chartHeight={444}
        seriesData={mainChart.series}
      />
    </CollpaseZone>
  )
}

// 主图 CD 预览：执行器和测量对象所有位号在当前时间的详细图表
const MainCDPreview = (props: CMDProps) => {
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
            field: 'SPValue',
            chartOption: {
              barOption: {
                name: 'SP值'
              }
            }
          },
          {
            field: 'PVValue',
            chartOption: {
              legend: { data: [{ icon: 'circle' }] },
              lineOption: {
                name: 'PV值',
                symbol: 'circle',
                symbolSize: 6,
                areaStyle: { color: 'rgba(0,0,0,0)' }
              },
            }
          },
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
    }

    return {
      ...target,
      series: [
        {
          field: 'PVValue',
          chartOption: {
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
        chartHeight={444}
        seriesData={mainChart.series}
      />
    </CollpaseZone>
  )
}

interface Props extends CMDProps {
  preview: string
}
// 主图预览 执行器/测量对象
const HistoryPreviewMain = (props: Props) => {
  const { previewType, preview, chart, matchChart } = props
  return (
    <div className='data-preview__chart-preview'>
      {
        preview === $consts['DATAPREVIEW/PREVIEW_TYPE_CD']
          ? <MainCDPreview previewType={previewType} chart={chart} matchChart={matchChart} />
          : <MainMDPreview previewType={previewType} chart={chart} matchChart={matchChart} />
      }
    </div>
  )
}

export default HistoryPreviewMain