import { useState, useEffect } from 'react'
import 'src/styles/components/common/loading.less'

type Props = {
  loading: boolean,
  delay?: number
}
const Loading = (props: Props) => {
  const [visible, setVisible] = useState(props.loading)
  const [percent, setPercent] = useState(0)
  const [start, setStart] = useState(false)

  useEffect(() => {
    let handler: any = -1
    const step = percent > 80 ? 0.01 : percent > 60 ? 0.04 : percent > 40 ? 0.1 : percent > 20 ? 0.2 : 0.5
    
    if (props.loading) {
      if (start) {
        setVisible(true)
        handler = setTimeout(() => {
          percent <= 90 && setPercent(percent + step)
        }, 10)
      } else {
        handler = setTimeout(() => {
          setStart(true)
        }, props.delay || 200)
      }
    } else {
      setVisible(false)
      setPercent(0)
      setStart(false)
    }

    return () => clearTimeout(handler)
  }, [props.loading, percent, start])

  if (!visible) return null

  return (
    <div className='loading'>
      <div className='loading__content'>
        <div className='loading__content-shape shape-1' />
        <div className='loading__content-shape shape-2' />
        <div className='loading__content-shape shape-3' />
        <div className='loading__content-shape shape-4' />
      </div>
    </div>
  )
}

export default Loading
