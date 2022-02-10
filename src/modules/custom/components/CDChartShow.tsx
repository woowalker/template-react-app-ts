import { useState, useEffect, useMemo, useRef } from 'react'
import { Slider, Checkbox } from 'antd'
import CDChart from './CDChart'
import { usePrevious, useDomSize } from 'src/hooks'
import { cloneDeep, isEqual } from 'lodash'
import 'src/styles/modules/components/chartShow.less'

type Props = {
  chartData: any,
  alignChartData?: any,
  chartOption?: any,
  chartHeight?: number,
  seriesData: any,
  slider?: number,
  sliderStyle?: Object,
  sliderVisible?: boolean,
  timeVisible?: boolean,
  checkboxVisible?: boolean,
  onChange?: Function,
  onAlignChange?: Function,
  onChartChange?: Function,
  onCheckedChange?: Function
}

const CDChartShow = (props: Props) => {
  // 是否根据对齐数据画图
  const targetAlign = useMemo(() => {
    const { PositionNumbers: alignPoints = [] } = props.alignChartData || {}
    return !!alignPoints.length
  }, [props.alignChartData])

  // 图表数据有效的 PositionNumber 集
  const validPoints = useMemo(() => {
    const { PositionNumbers: initPoints = [] } = props.chartData
    return initPoints.map((item: any) => item[targetAlign ? 'AlignPositionNumber' : 'PositionNumber'])
  }, [props.chartData, targetAlign])

  // Slider min max 范围
  const range = useMemo(() => {
    const { chartData, alignChartData = {} } = props
    const { PositionNumbers: initPoints = [] } = chartData
    const { PositionNumbers: alignPoints = [] } = alignChartData
    const points = targetAlign ? alignPoints : initPoints
    return {
      min: points[0]?.PositionNumber || 1,
      max: points[points.length - 1]?.PositionNumber || 100
    }
  }, [props.chartData, targetAlign])

  // Slider
  const [slider, setSlider] = useState(0)

  // 根据对齐数据画图计算出对应的 Slider
  const getValidSlider = (value: number | undefined, revert: boolean = false) => {
    if (!targetAlign) return value

    const { chartData } = props
    const { PositionNumbers: initPoints = [] } = chartData
    if (revert) {
      const find = initPoints.find((item: any) => item.PositionNumber === value)
      return find?.AlignPositionNumber
    }
    const find = initPoints.find((item: any) => item.AlignPositionNumber === value)
    return find?.PositionNumber
  }

  // 滑块滑动时，从 validPoints 中取离当前滑块最近的一个有效值
  const handleSliderChange = (val: number) => {
    if (!validPoints.includes(val)) {
      const copyData = cloneDeep(validPoints)
      copyData.push(val)
      copyData.sort((a: number, b: number) => a - b)
      const index = copyData.indexOf(val)
      if (index === 0 || index === copyData.length - 1) {
        val = index === 0 ? validPoints[0] : validPoints[validPoints.length - 1]
      } else {
        const prevDiff = copyData[index] - copyData[index - 1]
        const nextDiff = copyData[index + 1] - copyData[index]
        val = prevDiff > nextDiff ? copyData[index + 1] : copyData[index - 1]
      }
    }
    setSlider(val)
    props.onChange instanceof Function && props.onChange(getValidSlider(val))
  }

  // 初始化 Slider 的位置
  const prevPoints = usePrevious(validPoints)
  useEffect(() => {
    // 切换执行器和测量对象预览时候，会出现位号标记线，所以这边 slider 不显示的时候，不设置 slider
    const { sliderVisible = true } = props
    // 当 props.chartData 变更时候（手动设定SP），validPoints 依赖这个属性，这时候不希望 slider 变化，所以添加 isEqual 判断
    if (!isEqual(prevPoints, validPoints) && sliderVisible) {
      handleSliderChange(validPoints[Math.floor((validPoints.length - 1) / 2)])
    }
  }, [validPoints])

  // 同步更新父组件的 props.slider，注意该 effect 需要在【初始化 Slider 的位置】的 effect 后面，以 props.slider 为主
  useEffect(() => {
    setSlider(getValidSlider(props.slider, true)) // 不判断 props.slider !== undefined，因为对不齐的情况下，不显示位号标记线
  }, [props.slider])

  // 如果是对齐图表，并且最终的 slider 为 undefined，表明被对齐图表的位号在该对齐图表中不存在，这时候调整 slider，以确保位号线初始存在
  const refOfInitDone = useRef(false)
  useEffect(() => {
    // 定时器是为了保证渲染完毕，slider 是最终的值，因为一开始 props.slider 也可能是 undefined，但是这个时候并不希望这个 effect 调用
    let timer = setTimeout(() => {
      if (slider === undefined && targetAlign && !refOfInitDone.current) {
        refOfInitDone.current = true
        const validSlider = validPoints[Math.floor((validPoints.length - 1) / 2)]
        props.onAlignChange instanceof Function && props.onAlignChange(validSlider)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [slider, targetAlign, validPoints])

  // 滑块值匹配的图表数据
  const matchChartData = useMemo(() => {
    const { PositionNumbers = [] } = props.chartData
    return PositionNumbers.find((item: any) => item.PositionNumber === getValidSlider(slider))
  }, [slider, props.chartData])
  useEffect(() => {
    props.onChartChange instanceof Function && props.onChartChange(matchChartData)
  }, [matchChartData])

  // 柱状图表复选框
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])
  const handleCheckChange = (val: number, checked: boolean) => {
    checked ? setCheckedKeys(checkedKeys.concat(val)) : setCheckedKeys(checkedKeys.filter((item: number) => item !== val))
  }
  const handleCheckAll = (checked: boolean) => {
    const { chartData } = props
    checked ? setCheckedKeys(chartData.PositionNumbers.map((item: any) => item.PositionNumber)) : setCheckedKeys([])
  }
  useEffect(() => {
    props.onCheckedChange instanceof Function && props.onCheckedChange(checkedKeys)
  }, [checkedKeys])

  // 判断图表数据是否更新
  const prevChartData = usePrevious(props.chartData)
  useEffect(() => {
    const updated = !isEqual(prevChartData, props.chartData)
    updated && setCheckedKeys([])
  }, [props.chartData])

  // 图表宽度
  const refOfSlider = useRef(null)
  const domSize = useDomSize(refOfSlider)
  const chartWidth = useMemo(() => {
    // 90: slider 的 padding 值
    return domSize.clientWidth - 90
  }, [domSize])

  const {
    sliderStyle,
    sliderVisible = true,
    timeVisible,
    checkboxVisible = false,
    chartData,
    alignChartData = {},
    chartHeight,
    chartOption,
    seriesData
  } = props

  const { PositionNumbers: initPoints = [] } = chartData
  const { PositionNumbers: alignPoints = [] } = alignChartData
  const points = targetAlign ? alignPoints : initPoints
  const gap = chartWidth / (points.length - 1)

  return (
    <div className='chart-show'>
      {
        sliderVisible
          ? (
            <div ref={refOfSlider} className='chart-show__slider' style={sliderStyle}>
              <Slider
                {...range}
                value={slider}
                tipFormatter={val => getValidSlider(val)}
                onChange={handleSliderChange}
              />
            </div>
          )
          : null
      }
      <div className='chart-show__chart' style={{ height: chartHeight || 360 }}>
        {
          timeVisible
            ? (
              <div className='chart-show__chart-time'>
                {chartData.CurrentDataTime ? <span>当前时间：{chartData.CurrentDataTime}</span> : null}
                {chartData.LastSnapTime ? <span>快照时间：{chartData.LastSnapTime}</span> : null}
              </div>
            )
            : null
        }
        <CDChart
          chartData={chartData}
          alignChartData={alignChartData}
          chartOption={chartOption}
          seriesData={seriesData}
          position={slider}
        />
      </div>
      {
        checkboxVisible
          ? (
            <div className='chart-show__checkbox'>
              {
                points.length
                  ? (
                    <Checkbox
                      indeterminate={!!checkedKeys.length && checkedKeys.length !== chartData.PositionNumbers.length}
                      onChange={evt => handleCheckAll(evt.target.checked)}
                      className='chart-show__checkbox-all'
                    />
                  )
                  : null
              }
              {
                points.map((item: any, index: number) => {
                  let { PositionNumber: point } = item
                  if (targetAlign) {
                    const find = initPoints.find((init: any) => init.AlignPositionNumber === point)
                    point = find?.PositionNumber
                  }
                  if (point) {
                    return (
                      <div
                        key={`${point}_${index}`}
                        className='chart-show__checkbox-point'
                        style={{ left: `${gap * index + 60}px` }}
                      >
                        <Checkbox
                          checked={checkedKeys.indexOf(point) !== -1}
                          onChange={evt => handleCheckChange(point, evt.target.checked)}
                        />
                      </div>
                    )
                  }
                  return <div key={`${point}_${index}`} className='chart-show__checkbox-point opacity-0' />
                })
              }
            </div>
          )
          : null
      }
    </div>
  )
}

export default CDChartShow