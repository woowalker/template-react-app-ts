import { useMemo } from 'react'
import * as customPages from 'src/modules/custom'

type Props = {
  name: string
}

const LoadablePage = (props: Props) => {
  const Component = useMemo(() => {
    // @ts-ignore
    if (customPages[props.name]) return customPages[props.name]
    return () => null
  }, [props.name])

  return <Component />
}

export default LoadablePage