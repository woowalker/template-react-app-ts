import { get } from 'lodash'

type CellOptions = {
  record: any,
  field: string
}
export const renderTableCell = (options: CellOptions) => {
  const { record, field } = options
  let cell = get(record, field)
  if (Array.isArray(cell)) {
    cell = cell.join(';')
  }
  return cell
}