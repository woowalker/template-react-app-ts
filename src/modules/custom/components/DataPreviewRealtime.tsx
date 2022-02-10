import { RealTimeAct, RealTimeMea } from '.'
import { $consts } from 'src/plugins'

type Props = {
  filter: any,
  controlId: string | number,
  previewType: string
}
const DataPreviewRealtime = (props: Props) => {
  if (props.previewType === $consts['DATAPREVIEW/PREVIEW_TYPE_ACTUATOR']) {
    return <RealTimeAct filter={props.filter} controlId={props.controlId} />
  }
  return <RealTimeMea filter={props.filter} controlId={props.controlId} />
}

export default DataPreviewRealtime