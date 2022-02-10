import { useState, useEffect } from 'react'
import ReactEcharts from 'echarts-for-react'
import { cloneDeep } from 'lodash'

type BarOption = {
  // echarts 配置
  name: string,
  itemStyle: any
}

type LineOption = {
  // echarts 配置
  name: string,
  lineStyle: any,
  itemStyle: any,
  areaStyle: any
}

type ChartOption = {
  // echarts 配置
  title: any,
  legend: any,
  grid: any,
  tooltip: any,
  xAxis: any,
  yAxis: any,
  // 自定义配置
  lineOption: LineOption,
  barOption: BarOption
}

type SeriesData = {
  // 自定义配置
  field: string,
  data: any[],
  checkLoop?: boolean,
  chartOption?: ChartOption
}

const barMaxWidth = 13
const presetColors = [
  '133, 84, 158',
  '0, 183, 238',
  '50, 177, 108',
  '250, 140, 22',
  '255, 77, 79',
  '255, 236, 61',
  '8, 151, 156',
  '158, 16, 104',
  '255, 251, 230',
  '120, 6, 80'
]
const seriesOption = (chart: SeriesData, index: number) => {
  const { data, chartOption = {} } = chart
  const { lineOption, barOption } = chartOption as ChartOption

  const itemColor = presetColors[index % presetColors.length]

  if (lineOption) {
    return {
      symbol: 'none',
      ...lineOption,
      type: 'line',
      lineStyle: {
        color: `rgba(${itemColor}, 1)`,
        ...lineOption?.lineStyle
      },
      itemStyle: {
        color: `rgba(${itemColor}, 1)`,
        ...lineOption?.itemStyle
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: `rgba(${itemColor}, 0.6)`
            },
            {
              offset: 1,
              color: `rgba(${itemColor}, 0.05)`
            }
          ]
        },
        ...lineOption?.areaStyle
      },
      data
    }
  }

  if (barOption) {
    return {
      barWidth: barMaxWidth,
      ...barOption,
      type: 'bar',
      itemStyle: {
        color: `rgba(${itemColor}, 1)`,
        ...barOption?.itemStyle
      },
      data
    }
  }

  return { data }
}

type Props = {
  chartData: any,
  chartOption?: ChartOption,
  seriesData: SeriesData[],
  position?: number
}

const TimeChart = (props: Props) => {
  const [option, setOption] = useState<any>()
  useEffect(() => {
    // 定时器保证图表是在最后更新的，以提高界面显示性能
    let timer = setTimeout(() => {
      const { chartData, chartOption, seriesData, position } = props
      const { Data = [], Name: name, Unit: title = 'gsm', CoordinateMax = 0, CoordinateMin = 0 } = chartData

      // 将类目轴转成数值轴
      const points = cloneDeep(Data)
      points.forEach((point: any, index: number) => {
        point.PositionNumber = index + 1
      })

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
      // 位号标记线
      position !== undefined && markLines.markLine.data.push({
        name: '位号',
        xAxis: position,
        label: { formatter: '' }
      })
      // 上界标记线
      CoordinateMax && markLines.markLine.data.push({
        name: '上界',
        yAxis: CoordinateMax
      })
      // 下界标记线
      CoordinateMin && markLines.markLine.data.push({
        name: '下界',
        yAxis: CoordinateMin
      })

      // 根据 seriesData 筛选出需要展示的数据
      const copyData = cloneDeep(seriesData)
      points.forEach((item: any, index: number) => {
        copyData.forEach((chart: any) => {
          // PositionNumbers 里面有的字段才显示在图表上
          if (item[chart.field] !== undefined) {
            !chart.data && (chart.data = [])
            if (chart.checkLoop && item.IsCloseLoop !== undefined) {
              chart.data[index] = {
                value: [item.PositionNumber, item[chart.field]],
                itemStyle: { color: item.IsCloseLoop ? '#ffc355' : '#5bb86d' }
              }
            } else {
              chart.data[index] = {
                value: [item.PositionNumber, item[chart.field]]
              }
            }
          }
        })
      })
      const chartsData = copyData.filter((item: any) => item.data?.length)

      // 计算 XMin XMax 的值
      const xMin = points[0]?.PositionNumber
      const xMax = points[points.length - 1]?.PositionNumber
      // 计算 YMax 的值
      const yVals: any = []
      chartsData.forEach((item: any) => yVals.push(...item.data.map((i: any) => i.value[1])))
      const yAxisMax = Math.ceil(Math.max(CoordinateMax, ...yVals.filter((item: any) => item !== undefined)) * 1.15)
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
        legend: {
          top: 0,
          ...chartOption?.legend,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          data: chartsData.map((series: SeriesData) => {
            const { chartOption = {} } = series
            const { legend = {}, lineOption = {}, barOption = {} } = chartOption as ChartOption
            const { name: lineName } = lineOption as LineOption
            const { name: barName } = barOption as LineOption
            const { data = [] } = legend
            return {
              name: lineName || barName,
              ...data[0]
            }
          }),
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
          /**
           * axis 表示 tooltip 根据 xAxis 进行触发，这样鼠标只要在图上，就会自动匹配到 X 轴数据，并显示对应的 Y 轴数据
           * item 表示 tooltip 只会根据选中的项进行触发，如果鼠标不在选中项上，则 tooltip 不会触发
           */
          trigger: 'axis',
          borderColor: 'rgba(0,0,0,0)',
          ...chartOption?.tooltip,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          formatter: (params: any) => {
            const { seriesName, marker, value } = params[0]
            const find = points.find((item: any) => item.PositionNumber === value[0])
            return (`
            <div>
              <p>${find?.Time || ''}</p>
              <span>${marker}${seriesName} ${value[1]}</span>
            </div>
          `)
          },
        },
        xAxis: {
          min: xMin || null,
          max: xMax || null,
          maxInterval: 50,
          ...chartOption?.xAxis,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#BFBFBF'
            }
          },
          axisTick: {
            alignWithLabel: true,
            ...chartOption?.xAxis?.axisTick
          },
          axisLabel: {
            color: '#BFBFBF',
            fontSize: 11,
            formatter: (val: number) => {
              const find = points.find((item: any) => item.PositionNumber === val)
              return find?.Time
            }
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name,
          nameLocation: 'center',
          nameGap: 40,
          min: null,
          max: yAxisMax,
          offset: barMaxWidth,
          ...chartOption?.yAxis,
          // 注意 chartOption 的展开位置，后面的属性不允许被 chartOption 完全覆盖
          nameTextStyle: {
            color: '#000000'
          },
          splitLine: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#BFBFBF'
            }
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: '#C5C5C5'
            }
          },
          axisLabel: {
            color: '#7B7B7B',
            fontSize: 11
          },
        },
        series: [markLines].concat(chartsData.map((series: SeriesData, index: number) => seriesOption(series, index)))
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [props.chartData, props.chartOption, props.position])

  if (!option) return null

  return (
    <ReactEcharts
      lazyUpdate
      option={option}
      style={{ height: '100%' }}
    />
  )
}

export default TimeChart