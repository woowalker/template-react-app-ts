export default [
  {
    name: 'getMachines',
    method: 'GET',
    path: '/CFG/Machine/GetMachines',
    params: {
      OrgId: ''
    },
    desc: '获取组织下的全部纸机'
  },
  {
    name: 'getOneDetail',
    method: 'GET',
    path: '/CFG/Machine/GetOneDetail',
    params: {
      OrgId: ''
    },
    desc: '获取单个纸机'
  },
  {
    name: 'getActuatorsByMachine',
    method: 'GET',
    path: '/CFG/Machine/GetActuatorsByMachine',
    params: {
      OrgId: ''
    },
    desc: '获取当前正在跑的控制组下的所有在跑控制器下的执行器及测量对象'
  },
  {
    name: 'getMachineCurveData',
    method: 'POST',
    path: '/CFG/Machine/GetMachineCurveData',
    params: {
      ActuatorId: '',
      MeasuringObjectIds: []
    },
    desc: '获取当前正在跑的控制组下的所有在跑控制器下的测量对象数据每天统计'
  },
]