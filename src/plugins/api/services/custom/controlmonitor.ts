export default [
  {
    name: 'getGroupInfo',
    method: 'GET',
    path: '/CFG/ControllerMonitor/GetGroupInfo',
    params: {
      OrgId: ''
    },
    desc: '获取控制器组信息'
  },
  {
    name: 'getControllerInfo',
    method: 'GET',
    path: '/CFG/ControllerMonitor/GetControllerInfo',
    params: {
      ControllerId: ''
    },
    desc: '获取控制器详细信息'
  },
  {
    name: 'getControllerStatus',
    method: 'GET',
    path: '/CFG/ControllerMonitor/GetControllerStatus',
    params: {
      ControllerId: ''
    },
    desc: '获取控制器状态信息'
  },
  {
    name: 'getPositionData',
    method: 'POST',
    path: '/CFG/ControllerMonitor/GetPositionData',
    params: {
      ControllerId: '',
      MeasuringObjectId: '',
      ActuatorId: ''
    },
    desc: '获取控制器位号数据'
  },
  {
    name: 'updateControllerEnableOption',
    method: 'POST',
    path: '/CFG/ControllerMonitor/UpdateControllerEnableOption',
    params: {
      ControllerId: '',
      Type: '',
      Value: ''
    },
    desc: '获取控制器位号数据'
  },
  {
    name: 'setStatus',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SetStatus',
    params: {
      Id: '',
      Name: '',
      Cmd: ''
    },
    desc: '设置控制器状态'
  },
  {
    name: 'updateContrllerStartMode',
    method: 'POST',
    path: '/CFG/ControllerMonitor/UpdateContrllerStartMode',
    params: {
      ControllerId: '',
      StartMode: ''
    },
    desc: '设置控制器状态'
  },
  {
    name: 'updateContorlSet',
    method: 'POST',
    path: '/CFG/ControllerMonitor/UpdateControllerSetting',
    params: {
      ControllerId: '',
      AutoInitVarId: '',
      DebugVarId: '',
      DCSVarId: ''
    },
    desc: '设置控制器状态'
  },
  {
    name: 'openOrCloseAllLoop',
    method: 'POST',
    path: '/CFG/ControllerMonitor/OpenOrCloseAllLoop',
    params: {
      ControllerId: '',
      ActuatorId: '',
      IsClose: '',
      MeasuringObjectId: ''
    },
    desc: '设置控制器全开闭环状态'
  },
  {
    name: 'openOrCloseLoop',
    method: 'POST',
    path: '/CFG/ControllerMonitor/OpenOrCloseLoop',
    params: {
      ControllerId: '',
      ActuatorId: '',
      IsClose: '',
      MeasuringObjectId: '',
      PositionNumbers: []
    },
    desc: '设置控制器选中开闭环状态'
  },
  {
    name: 'writeSetSPValue',
    method: 'POST',
    path: '/CFG/ControllerMonitor/WriteSetSPValue',
    params: {
      ControllerId: '',
      ActuatorId: '',
      PositionNumbers: []
    },
    desc: '手动设定SP写入操作'
  },
  {
    name: 'saveSetSPValue',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SaveSetSPValue',
    params: {
      ControllerId: '',
      ActuatorId: '',
      PositionNumbers: []
    },
    desc: '手动设定SP保存操作'
  },
  {
    name: 'restoreSetSPValue',
    method: 'POST',
    path: '/CFG/ControllerMonitor/RestoreSetSPValue',
    params: {
      ControllerId: '',
      ActuatorId: ''
    },
    desc: '手动设定SP还原操作'
  },
  {
    name: 'setTargetDeviation',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SetTargetDeviation',
    params: {
      ControllerId: '',
      MesuringObjectId: '',
      Value: '',
      IsSaveController: false
    },
    desc: '控制器设置测量目标偏置量'
  },
  {
    name: 'setSPValue',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SetSPValue',
    params: {
      ControllerId: '',
      ActuatorId: '',
      SPValue: ''
    },
    desc: '预设SP值'
  },
  {
    name: 'getActuatorByWrite',
    method: 'GET',
    path: '/CFG/ControllerMonitor/GetActuatorByWrite',
    params: {
      ControllerId: ''
    },
    desc: '获取需要写入的执行器列表(半闭环开窗)'
  },
  {
    name: 'writeSemiClosedLoopData',
    method: 'POST',
    path: '/CFG/ControllerMonitor/WriteSemiClosedLoopData',
    params: {
      ControllerId: '',
      ActuatorData: ''
    },
    desc: '控制器半闭环写入操作(可多个执行器一起)'
  },
  {
    name: 'giveUpSemiClosedLoopData',
    method: 'POST',
    path: '/CFG/ControllerMonitor/GiveUpSemiClosedLoopData',
    params: {
      ControllerId: '',
      ActuatorId: '',
      MeasuringObjectId: ''
    },
    desc: '控制器半闭环放弃操作'
  },
  {
    name: 'saveMeasuringObjectSnapshot',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SaveMeasuringObjectSnapshot',
    params: {
      Id: '' // 测量对象 Id
    },
    desc: '控制器中测量对象快照操作'
  },
  {
    name: 'saveActuatorSnapshot',
    method: 'POST',
    path: '/CFG/ControllerMonitor/SaveActuatorSnapshot',
    params: {
      Id: '' // 执行器 Id
    },
    desc: '控制器中执行器快照操作'
  },
  {
    name: 'getOtherControllerGroups',
    method: 'GET',
    path: '/CFG/ControllerMonitor/GetOtherControllerGroups',
    params: {
      MachineId: ''
    },
    desc: '获取其他控制器组'
  },
  {
    name: 'manualExchangeGroup',
    method: 'POST',
    path: '/CFG/ControllerMonitor/ManualExchangeGroup',
    params: {
      MachineId: '',
      NewGroupId: ''
    },
    desc: '手动切换组'
  }
]