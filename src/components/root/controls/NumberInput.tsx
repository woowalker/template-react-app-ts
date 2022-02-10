import { useMemo, useContext } from 'react'
import { Form, InputNumber } from 'antd'
import { EditContext } from 'src/components'
import { get } from 'lodash'
import { ControlProps } from 'src/components/root/LoadableControl'

const NumberInput = (props: ControlProps) => {
  const edit = useContext(EditContext)

  const handleChange = (val: number) => {
    const { FIELD_NAME } = props.config
    // 表单数据
    props.onChange instanceof Function && props.onChange({ [FIELD_NAME]: val })
  }

  const value = useMemo(() => {
    const { FIELD_NAME } = props.config
    return get(edit?.formBase, FIELD_NAME)
  }, [edit, props.config])

  const { evtConfig = {} } = props
  const { hidden = false, disabled = false } = evtConfig

  if (hidden) return null

  const { LABEL, REQUIRED } = props.config
  return (
    <Form.Item
      label={LABEL}
      required={REQUIRED}
      validateStatus={props.verify ? 'error' : undefined}
    >
      <InputNumber
        disabled={disabled}
        value={value}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
    </Form.Item>
  )
}

export default NumberInput