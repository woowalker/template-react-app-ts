import { useState, useEffect, useMemo } from 'react'
import { useLatest } from 'src/hooks'

const getTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - hours * 3600) / 60)
  const seconds = time - hours * 3600 - minutes * 60
  return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

type Props = {
  seconds: number,
  targetCount?: number,
  onCountChange?: Function,
  onCountDone?: Function,
  revert?: boolean,
  extraFont?: string,
  className?: string,
  style?: Object
}

const CountTime = (props: Props) => {
  const [count, setCount] = useState<number>(0)
 
  const refOfCountChange = useLatest(props.onCountChange)
  useEffect(() => {
    refOfCountChange.current?.(count)
  }, [count])

  const refOfCountDone = useLatest(props.onCountDone)
  useEffect(() => {
    let { seconds, targetCount = 0, revert } = props
    if (!seconds) {
      setCount(0)
      return
    }

    // 立即执行一次
    setCount(seconds)

    const timer = setInterval(() => {
      setCount(revert ? ++seconds : --seconds)
      if (seconds === targetCount) {
        clearInterval(timer)
        refOfCountDone.current?.()
      }
    }, 1000)

    return () => clearInterval(timer)

  }, [props.seconds, props.targetCount, props.revert])

  const nowTime = useMemo(() => {
    return getTime(count)
  }, [count])

  return <span className={props.className} style={props.style}>{`${props.extraFont}${nowTime}`}</span>
}

export default CountTime