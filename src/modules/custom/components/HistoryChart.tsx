import { useState, useEffect } from 'react'
import ReactEcharts from 'echarts-for-react'
import { cloneDeep } from 'lodash'

type ChartOption = {
  // echarts 配置
  title: any,
  legend: any,
  grid: any,
  tooltip: any,
  xAxis: any,
  yAxis: any,
  [propName: string]: any
}

type SeriesData = {
  // 自定义配置
  field: string,
  data: any[],
  chartOption?: ChartOption
}

const seriesOption = (chart: SeriesData) => {
  const { data, chartOption = {} as ChartOption } = chart

  return {
    ...chartOption,
    type: 'heatmap',
    data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      },
      ...chartOption.emphasis
    }
  }
}

type Props = {
  chartData: any,
  chartOption?: ChartOption,
  seriesData: SeriesData[],
  slider?: { xAxis: number, yAxis: number }
}

const HistoryChart = (props: Props) => {
  const [option, setOption] = useState<any>()
  useEffect(() => {
    // 定时器保证图表是在最后更新的，以提高界面显示性能
    let timer = setTimeout(() => {
      const { chartData, chartOption, seriesData, slider } = props
      const { Data = [], Name: name, Unit: title = 'gsm' } = chartData

      const points = cloneDeep(Data)

      // 标记线
      const markLines: any = {
        name: 'markLines',
        type: 'line',
        markLine: {
          symbol: 'none',
          silent: true,
          animation: false,
          label: {
            position: 'insideEndTop',
            formatter: '{b}: {c}'
          },
          lineStyle: {
            type: 'solid',
            color: '#bcbcbc'
          },
          data: []
        }
      }
      // 时间标记线
      slider?.xAxis !== undefined && markLines.markLine.data.push({
        name: '时间',
        xAxis: slider.xAxis,
        label: { formatter: '' }
      })
      // 位号标记线
      slider?.yAxis !== undefined && markLines.markLine.data.push({
        name: '位号',
        yAxis: slider.yAxis - 1,
        label: {
          formatter: function (params: any) {
            const { name, value } = params
            return `${name}：${value + 1}`
          }
        }
      })

      // x轴数据
      const xAxisData = points.map((point: any) => point.T)

      // y轴数据
      const yAxisData = points[0]?.P.map((p: any) => p[0]) || []

      // 根据 seriesData 筛选出需要展示的数据
      const copyData = cloneDeep(seriesData)
      const virtualMapRange: any = []
      points.forEach((item: any, index: number) => {
        const { P = [] } = item
        copyData.forEach((chart: any) => {
          // 根据 fieldIndex 对应 P 中的数据
          if (chart.fieldIndex !== undefined) {
            !chart.data && (chart.data = [])
            const yMapToXData: any = []
            P.forEach((p: any, pi: number) => {
              yMapToXData.push([index, pi, p[chart.fieldIndex]])
              virtualMapRange.push(p[chart.fieldIndex])
            })
            chart.data.push(...yMapToXData)
          }
        })
      })
      const chartsData = copyData.filter((item: any) => item.data?.length)

      setOption({
        title: {
          top: 0,
          left: 60,
          text: title,
          ...chartOption?.title,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          textStyle: {
            fontSize: 12,
            fontWeight: 'normal',
            color: '#aaa',
            ...chartOption?.title?.textStyle
          },
        },
        grid: {
          top: 20,
          right: 30,
          bottom: 20,
          left: 60,
          containLabel: false,
          ...chartOption?.grid
        },
        tooltip: {
          borderColor: 'rgba(0,0,0,0)',
          ...chartOption?.tooltip,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          formatter: (params: any) => {
            const { name, marker, value } = params
            return (`
            <div>
              <p>${name}</p>
              <span>${marker}位号${value[1] + 1} ${value[2]}</span>
            </div>
          `)
          },
        },
        xAxis: {
          ...chartOption?.xAxis,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          type: 'category',
          data: xAxisData,
          splitArea: {
            show: true
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true
          }
        },
        yAxis: {
          name,
          nameLocation: 'center',
          nameGap: 40,
          offset: 13,
          ...chartOption?.yAxis,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          type: 'category',
          data: yAxisData,
          nameTextStyle: {
            color: '#000000'
          },
          splitArea: {
            show: true
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true
          }
        },
        visualMap: {
          min: Math.min(...virtualMapRange),
          max: Math.max(...virtualMapRange),
          show: false
        },
        series: [markLines].concat(chartsData.map((series: SeriesData) => seriesOption(series)))
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [props.chartData, props.chartOption, props.slider])

  if (!option) return null

  return (
    <ReactEcharts
      lazyUpdate
      option={option}
      style={{ height: '100%' }}
    />
  )
}

export default HistoryChart