import { useMemo } from 'react'
import { $consts } from 'src/plugins'

type Props = {
  status: string | number,
  className?: string,
  style?: Object
}
const PaperMachineStatus = (props: Props) => {
  const backgroundColor = useMemo(() => {
    switch (props.status) {
      case $consts['PAPERMONITOR/MACHINE_OFFLINE']:
        return '#ff4d4f'
      case $consts['PAPERMONITOR/MACHINE_DISABLED']:
        return '#c4c4c4'
      default:
        return '#52c41a'
    }
  }, [props.status])

  return <div className={props.className} style={{ width: 20, height: 20, borderRadius: 10, ...props.style, backgroundColor }} />
}

export default PaperMachineStatus