import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

type Props = {
  extraFont?: string,
  className?: string,
  style?: Object
}

const NowTime = (props: Props) => {
  const [nowTime, setNowTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))

  useEffect(() => {
    let timer = setInterval(() => {
      setNowTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <span className={props.className} style={props.style}>{`${props.extraFont}${nowTime}`}</span>
}

export default NowTime