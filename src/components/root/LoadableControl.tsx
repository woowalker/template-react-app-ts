import { useState, useEffect, useMemo, useContext } from 'react'
import { TextInput, NumberInput, PaginationSelect, SwitchControl } from './controls'
import { EditContext } from 'src/components'
import { $consts, $evt } from 'src/plugins'
import { verifyField } from 'src/components/root/helper'

type Props = {
  config: any
}

export type EvtConfig = {
  disabled?: boolean,
  hidden?: boolean
}

export type ControlProps = {
  config: any,
  onChange?: Function,
  verify?: boolean,
  evtConfig?: EvtConfig
}

const LoadableControl = (props: Props) => {
  const edit = useContext(EditContext)

  // 监听控件相关事件
  const [evtConfig, setEvtConfig] = useState<EvtConfig>({})
  useEffect(() => {
    const disableControl = (field: string) => {
      const { FIELD_NAME } = props.config
      field === FIELD_NAME && setEvtConfig(prev => ({ ...prev, disabled: true }))
    }
    const enableControl = (field: string) => {
      const { FIELD_NAME } = props.config
      field === FIELD_NAME && setEvtConfig(prev => ({ ...prev, disabled: false }))
    }

    $evt.addListener($consts['COMMON/EVT_DISABLE_CONTROL'], disableControl)
    $evt.addListener($consts['COMMON/EVT_ENABLE_CONTROL'], enableControl)

    return () => {
      $evt.removeListener($consts['COMMON/EVT_DISABLE_CONTROL'], disableControl)
      $evt.removeListener($consts['COMMON/EVT_ENABLE_CONTROL'], enableControl)
    }
  }, [props.config])

  // 校验配置
  const [verify, setVerify] = useState(false)
  const handleChange = (fieldBase: any) => {
    const { CHANGE_FUNC } = props.config
    if (edit) {
      const formBase = { ...edit.formBase, ...fieldBase }
      // 表单数据
      edit.setFormBase(formBase)
      // 表单检验
      setVerify(verifyField(props.config, formBase))
      // 是否配置了动态加载 js 中的方法名
      edit.dynamicJs[CHANGE_FUNC] instanceof Function && edit.dynamicJs[CHANGE_FUNC]({ ...edit, formBase })
    }
  }

  // EditPage 保存时进行的总校验
  const baseVerify = useMemo(() => {
    const { FIELD_NAME } = props.config
    // 原始校验字段
    const matchVerify = edit?.verify?.[FIELD_NAME]
    // 校验字段是否在白名单中，在则不校验
    const matchWhiteList = edit?.verifyWhiteList?.includes(FIELD_NAME)
    return matchWhiteList ? false : matchVerify
  }, [edit, props.config])
  useEffect(() => {
    setVerify(baseVerify)
  }, [baseVerify])

  const { CONTROL_TYPE } = props.config
  switch (CONTROL_TYPE) {
    // 文本框控件
    case $consts['TABLE/CONTROL_TYPE_TEXTINPUT']:
      return (
        <TextInput
          config={props.config}
          evtConfig={evtConfig}
          verify={verify}
          onChange={handleChange}
        />
      )
    // 单选 Switch 控件
    case $consts['TABLE/CONTROL_TYPE_SWITCH']:
      return (
        <SwitchControl
          config={props.config}
          evtConfig={evtConfig}
          verify={verify}
          onChange={handleChange}
        />
      )
    // 数值框控件
    case $consts['TABLE/CONTROL_TYPE_NUMBERINPUT']:
      return (
        <NumberInput
          config={props.config}
          evtConfig={evtConfig}
          verify={verify}
          onChange={handleChange}
        />
      )
    // 分页下拉控件
    case $consts['TABLE/CONTROL_TYPE_PAGINATION_SELECT']:
      return (
        <PaginationSelect
          config={props.config}
          evtConfig={evtConfig}
          verify={verify}
          onChange={handleChange}
        />
      )
    default:
      return <div />
  }
}

export default LoadableControl