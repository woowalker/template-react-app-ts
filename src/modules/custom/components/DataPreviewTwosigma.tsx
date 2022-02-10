import DataPreviewAvg, { AvgProps } from './DataPreviewAvg'

const DataPreviewTwosigma = (props: AvgProps) => {
  return <DataPreviewAvg isSigma {...props} />
}

export default DataPreviewTwosigma