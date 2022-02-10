import { useState, useEffect, useMemo } from 'react'
import { Slider } from 'antd'
import TimeChart from './TimeChart'
import 'src/styles/modules/components/chartShow.less'

type Props = {
  chartData: any,
  chartOption?: any,
  chartHeight?: number,
  seriesData: any,
  slider?: string,
  sliderPosition?: 'top' | 'bottom',
  sliderStyle?: Object,
  sliderVisible?: boolean,
  onChange?: Function,
  onChartChange?: Function
}

const TimeChartShow = (props: Props) => {
  // 图表数据有效的 PositionNumber 集
  const validPoints = useMemo(() => {
    const { Data = [] } = props.chartData
    return Data.map((item: any) => item.Time)
  }, [props.chartData])

  // Slider min max 范围
  const range = useMemo(() => {
    return {
      min: 1,
      max: validPoints.length
    }
  }, [validPoints])

  // Slider
  const [slider, setSlider] = useState(0)

  // slider 和 time 相互转换
  const getValidSlider = (value: string | number, revert: boolean = false) => {
    // @ts-ignore
    return revert ? validPoints.indexOf(value) + 1 : validPoints[value - 1]
  }

  // 滑块滑动处理
  const handleSliderChange = (val: number) => {
    setSlider(val)
    props.onChange instanceof Function && props.onChange(getValidSlider(val))
  }

  // 初始化 Slider 的位置
  useEffect(() => {
    // 切换执行器和测量对象预览时候，会出现位号标记线，所以这边 slider 不显示的时候，不设置 slider
    const { sliderVisible = true } = props
    sliderVisible && handleSliderChange(Math.ceil(validPoints.length / 2))
  }, [props.sliderVisible, validPoints])

  // 同步更新父组件的 props.slider，注意该 effect 需要在【初始化 Slider 的位置】的 effect 后面，以 props.slider 为主
  useEffect(() => {
    setSlider(getValidSlider(props.slider || 0, true)) // 不判断 props.slider !== undefined，因为一些情况下，不需要显示位号标记线
  }, [props.slider])

  // 滑块值匹配的图表数据
  const matchChartData = useMemo(() => {
    const { Data = [] } = props.chartData
    return Data.find((item: any) => item.Time === getValidSlider(slider))
  }, [slider, props.chartData])
  useEffect(() => {
    props.onChartChange instanceof Function && props.onChartChange(matchChartData)
  }, [matchChartData])

  const {
    sliderPosition = 'top',
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
        sliderVisible && sliderPosition === 'top'
          ? (
            <div className='chart-show__slider' style={sliderStyle}>
              <Slider
                {...range}
                value={slider}
                // @ts-ignore
                tipFormatter={val => getValidSlider(val)}
                onChange={handleSliderChange}
              />
            </div>
          )
          : null
      }
      <div className='chart-show__chart' style={{ height: chartHeight || 360 }}>
        <TimeChart
          chartData={chartData}
          chartOption={chartOption}
          seriesData={seriesData}
          position={slider}
        />
      </div>
      {
        sliderVisible && sliderPosition === 'bottom'
          ? (
            <div className='chart-show__slider' style={sliderStyle}>
              <Slider
                {...range}
                value={slider}
                // @ts-ignore
                tipFormatter={val => getValidSlider(val)}
                onChange={handleSliderChange}
              />
            </div>
          )
          : null
      }
    </div>
  )
}

export default TimeChartShow