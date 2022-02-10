import { useMemo, useContext } from 'react'
import { Form, Switch } from 'antd'
import { EditContext } from 'src/components'
import { get } from 'lodash'
import { ControlProps } from 'src/components/root/LoadableControl'

const SwitchControl = (props: ControlProps) => {
  const edit = useContext(EditContext)

  const handleChange = (checked: boolean) => {
    const { FIELD_NAME } = props.config
    // 表单数据
    props.onChange instanceof Function && props.onChange({ [FIELD_NAME]: checked })
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
      <Switch disabled={disabled} checked={value} onChange={handleChange} />
    </Form.Item>)
}

export default SwitchControl
