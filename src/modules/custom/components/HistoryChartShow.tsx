import { useState, useEffect, useMemo, useRef } from 'react'
import { Slider } from 'antd'
import HistoryChart from './HistoryChart'
import { useDomSize } from 'src/hooks'
import { cloneDeep } from 'lodash'
import 'src/styles/modules/components/chartShow.less'

export interface SliderProps {
  xAxis: string,
  yAxis: number
}

type Props = {
  chartData: any,
  alignChartData?: any,
  chartOption?: any,
  chartHeight?: number,
  seriesData: any,
  slider?: SliderProps,
  sliderStyle?: Object,
  sliderVisible?: boolean,
  onChange?: Function,
  onRangeChange?: Function,
  onChartChange?: Function
}

const HistoryChartShow = (props: Props) => {
  /**
   * P:[[1, 2, 4.55, 9.88, 0, 0]]
   * P:[[位号, 对齐位号, SP值, PV值, 上界, 下界]]
   */

  // 图表数据有效的时间点集
  const validPoints = useMemo(() => {
    const { Data = [] } = props.chartData
    return {
      xAxis: Data.map((item: any) => item.T),
      yAxis: Data[0]?.P.map((p: any) => p[0]) || []
    }
  }, [props.chartData])

  // 对齐图表对齐的有效位号
  const validAlignPoint = useMemo(() => {
    const { alignChartData = [] } = props
    let align: number[] = []
    alignChartData.forEach((chart: any) => {
      const { Data = [] } = chart
      const points: number[] = []
      Data[0]?.P && Data[0].P.forEach((p: any) => {
        points.push(p[1])
      })
      // 取所有对齐图表都能对的上的被对齐图表的位号
      !align.length && (align = points)
      align = align.filter((val: number) => val && points.includes(val))
    })
    return align
  }, [props.alignChartData])

  // Slider min max 范围
  const range = useMemo(() => {
    return {
      xAxis: {
        min: 0,
        max: validPoints.xAxis.length - 1
      },
      yAxis: {
        min: 1,
        max: validPoints.yAxis.length
      }
    }
  }, [validPoints])
  useEffect(() => {
    props.onRangeChange instanceof Function && props.onRangeChange(range)
  }, [range])

  // Slider
  const [slider, setSlider] = useState({ xAxis: 0, yAxis: 0 })

  // slider 和 time 相互转换
  const getValidSlider = (value: string | number, type: 'xAxis' | 'yAxis', revert: boolean = false) => {
    if (revert) {
      return type === 'xAxis' ? validPoints.xAxis.indexOf(value) : validPoints.yAxis.indexOf(value) + 1
    }
    // @ts-ignore
    return type === 'xAxis' ? validPoints.xAxis[value] : validPoints.yAxis[value - 1]
  }

  // 滑块滑动处理
  const handleSliderChange = (val: number, type: 'xAxis' | 'yAxis') => {
    const newSlider = { ...slider, [type]: val }
    setSlider(newSlider)
    props.onChange instanceof Function && props.onChange({
      xAxis: getValidSlider(newSlider.xAxis, 'xAxis'),
      yAxis: getValidSlider(newSlider.yAxis, 'yAxis')
    })
  }

  // 初始化 Slider 的位置
  useEffect(() => {
    const newSlider = {
      xAxis: Math.ceil(validPoints.xAxis.length / 2),
      yAxis: Math.ceil(validPoints.yAxis.length / 2)
    }
    // 从 validAlignPoint 中取离当前滑块最近的一个有效值
    if (validAlignPoint.length && !validAlignPoint.includes(newSlider.yAxis)) {
      const copyData = cloneDeep(validAlignPoint)
      copyData.push(newSlider.yAxis)
      copyData.sort((a: number, b: number) => a - b)
      const index = copyData.indexOf(newSlider.yAxis)
      if (index === 0 || index === copyData.length - 1) {
        newSlider.yAxis = index === 0 ? validAlignPoint[0] : validAlignPoint[validAlignPoint.length - 1]
      } else {
        const prevDiff = copyData[index] - copyData[index - 1]
        const nextDiff = copyData[index + 1] - copyData[index]
        newSlider.yAxis = prevDiff > nextDiff ? copyData[index + 1] : copyData[index - 1]
      }
    }
    setSlider(newSlider)
    props.onChange instanceof Function && props.onChange({
      xAxis: getValidSlider(newSlider.xAxis, 'xAxis'),
      yAxis: getValidSlider(newSlider.yAxis, 'yAxis')
    })
  }, [validPoints, validAlignPoint])

  // 同步更新父组件的 props.slider，注意该 effect 需要在【初始化 Slider 的位置】的 effect 后面，以 props.slider 为主
  useEffect(() => {
    if (props.slider !== undefined) {
      setSlider({
        xAxis: getValidSlider(props.slider.xAxis, 'xAxis', true),
        yAxis: getValidSlider(props.slider.yAxis, 'yAxis', true)
      })
    }
  }, [props.slider])

  // 滑块值匹配的图表数据
  const matchMain = useMemo(() => {
    const { Data = [] } = props.chartData
    const xAxis = Data.find((item: any) => item.T === getValidSlider(slider.xAxis, 'xAxis'))
    const main = {
      xAxis,
      yAxis: xAxis?.P.find((item: any) => item[0] === getValidSlider(slider.yAxis, 'yAxis'))
    }
    return main
  }, [slider, props.chartData])
  const matchAlign = useMemo(() => {
    const { alignChartData = [] } = props
    const align: any = []
    alignChartData.forEach((chart: any) => {
      const { Data = [] } = chart
      const xAxis = Data.find((item: any) => item.T === matchMain.xAxis?.T)
      const yAxis = xAxis?.P.find((item: any) => item[1] === getValidSlider(slider.yAxis, 'yAxis'))
      align.push({ xAxis, yAxis })
    })
    return align
  }, [slider, props.alignChartData, matchMain])
  useEffect(() => {
    props.onChartChange instanceof Function && props.onChartChange({ main: matchMain, align: matchAlign })
  }, [matchMain, matchAlign])

  const refOfDiv = useRef(null)
  const domSize = useDomSize(refOfDiv)
  const sliderPadding = useMemo(() => {
    if (!validPoints.xAxis.length) return '6px 30px 6px 60px'

    const { clientWidth } = domSize
    const padding = clientWidth / validPoints.xAxis.length / 2
    return `6px ${padding + 30}px 6px ${padding + 60}px`
  }, [domSize, validPoints])

  const {
    sliderStyle,
    sliderVisible = true,
    chartData,
    chartHeight,
    chartOption,
    seriesData
  } = props

  return (
    <div className='chart-show'>
      {
        sliderVisible
          ? (
            <div className='chart-show__slider' style={{ ...sliderStyle, padding: sliderPadding }}>
              <Slider
                {...range.xAxis}
                value={slider.xAxis}
                // @ts-ignore
                tipFormatter={val => getValidSlider(val, 'xAxis')}
                onChange={(val) => handleSliderChange(val, 'xAxis')}
              />
            </div>
          )
          : null
      }
      <div
        ref={refOfDiv}
        className='chart-show__chart'
        style={{ height: chartHeight || 360 }}
      >
        <HistoryChart
          chartData={chartData}
          chartOption={chartOption}
          seriesData={seriesData}
          slider={slider}
        />
      </div>
    </div>
  )
}

export default HistoryChartShow