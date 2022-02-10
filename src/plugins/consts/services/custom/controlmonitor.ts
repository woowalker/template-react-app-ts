import constMapToObj from 'src/plugins/consts/constMapToObj'

const controlCheckenable = [
  { name: 'IS_DCS', value: 1 },
  { name: 'IS_DEBUG', value: 2 },
  { name: 'IS_AUTO_CHANGE_GROUP', value: 3 },
  { name: 'IS_AUTO_INIT', value: 4 },
  { name: 'IS_SEMI_CLOSED_LOOP', value: 5 },
]

const controlCmd = [
  { name: 'CONTROL_CMD_START', value: 0, label: '启动' },
  { name: 'CONTROL_CMD_STOP', value: 1, label: '停止' },
  { name: 'CONTROL_CMD_ACTIVE', value: 2, label: '激活' },
  { name: 'CONTROL_CMD_PAUSE', value: 3, label: '暂停' },
  { name: 'CONTROL_CMD_RESTORE', value: 4, label: '恢复' },
  { name: 'CONTROL_CMD_INIT', value: 5, label: '初始化' },
  { name: 'CONTROL_CMD_WAIT_BEGIN', value: 6, label: '未开始' }
]

const controlMidStatus = [
  { name: 'CONTROL_MID_NONE', value: 0 },
  { name: 'CONTROL_MID_STARTING', value: 1 },
  { name: 'CONTROL_MID_STOPING', value: 2 }
]

export default [
  {
    name: 'CONTROL_CHECKENABLE',
    value: controlCheckenable
  },
  {
    name: 'CONTROL_CHECKENABLE_OBJ',
    value: constMapToObj(controlCheckenable)
  },
  ...controlCheckenable,
  {
    name: 'CONTROL_CMD',
    value: controlCmd
  },
  {
    name: 'CONTROL_CMD_OBJ',
    value: constMapToObj(controlCmd)
  },
  ...controlCmd,
  {
    name: 'CONTROL_MID_STATUS',
    value: controlMidStatus
  },
  {
    name: 'CONTROL_MID_STATUS_OBJ',
    value: constMapToObj(controlMidStatus)
  },
  ...controlMidStatus
]