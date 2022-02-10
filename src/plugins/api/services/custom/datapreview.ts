export default [
  {
    name: 'getControllerInfo',
    method: 'GET',
    path: '/CFG/DataPreview/GetControllerInfo',
    params: {
      ControllerId: ''
    },
    desc: '获取控制器详细信息'
  },
  {
    name: 'getMeasuringObjectListByActuator',
    method: 'GET',
    path: '/CFG/DataPreview/GetMeasuringObjectListByActuator',
    params: {
      ControllerId: '',
      ActuatorId: ''
    },
    desc: '获取当前控制器下当前执行器下的测量对象列表'
  },
  {
    name: 'getActuatorRealTimeData',
    method: 'GET',
    path: '/CFG/DataPreview/GetActuatorRealTimeData',
    params: {
      ControllerId: '',
      ActuatorId: ''
    },
    desc: '获取执行器实时数据-位号数据'
  },
  {
    name: 'setSnapshotByActuator',
    method: 'POST',
    path: '/CFG/DataPreview/SetSnapshotByActuator',
    params: {
      ControllerId: '',
      ActuatorId: '',
      MeasuringObjectIds: []
    },
    desc: '设置执行器预览快照'
  },
  {
    name: 'getRealTimeDataByMV',
    method: 'POST',
    path: '/CFG/DataPreview/GetRealTimeDataByMV',
    params: {
      ControllerId: '',
      ActuatorId: '',
      MeasuringObjectIds: []
    },
    desc: '实时数据-执行器关联的测量对象位号数据'
  },
  {
    name: 'getAvgOrSigmaDataByMV',
    method: 'POST',
    path: '/CFG/DataPreview/GetAvgOrSigmaDataByMV',
    params: {
      Type: '',
      ControllerId: '',
      ActuatorId: '',
      MeasuringObjectIds: [],
      StartTime: '',
      EndTime: ''
    },
    desc: '执行器预览-平均/2σ数据'
  },
  {
    name: 'getActuatorHistoryData',
    method: 'POST',
    path: '/CFG/DataPreview/GetActuatorHistoryData',
    params: {
      ControllerId: '',
      ActuatorId: '',
      StartTime: '',
      EndTime: ''
    },
    desc: '执行器预览-历史数据'
  },
  {
    name: 'getHistoryDataByMV',
    method: 'POST',
    path: '/CFG/DataPreview/GetHistoryDataByMV',
    params: {
      ControllerId: '',
      ActuatorId: '',
      MeasuringObjectIds: [],
      StartTime: '',
      EndTime: ''
    },
    desc: '执行器预览-历史数据-执行器关联测量对象历史数据'
  },
  {
    name: 'getActuatorListByMeasuringObject',
    method: 'GET',
    path: '/CFG/DataPreview/GetActuatorListByMeasuringObject',
    params: {
      ControllerId: '',
      MeasuringObjectId: ''
    },
    desc: '获取当前控制器下当前测量对象下的执行器列表'
  },
  {
    name: 'getMeasuringObjectRealTimeData',
    method: 'GET',
    path: '/CFG/DataPreview/GetMeasuringObjectRealTimeData',
    params: {
      ControllerId: '',
      MeasuringObjectId: ''
    },
    desc: '获取测量对象实时数据-位号数据'
  },
  {
    name: 'setSnapshotByMeasuringObject',
    method: 'POST',
    path: '/CFG/DataPreview/SetSnapshotByMeasuringObject',
    params: {
      ControllerId: '',
      MeasuringObjectId: '',
      ActuatorIds: []
    },
    desc: '设置测量对象预览快照'
  },
  {
    name: 'getRealTimeDataByCV',
    method: 'POST',
    path: '/CFG/DataPreview/GetRealTimeDataByCV',
    params: {
      ControllerId: '',
      MeasuringObjectId: '',
      ActuatorIds: []
    },
    desc: '获取测量对象实时数据-位号数据'
  },
  {
    name: 'getAvgOrSigmaDataByCV',
    method: 'POST',
    path: '/CFG/DataPreview/GetAvgOrSigmaDataByCV',
    params: {
      Type: '',
      ControllerId: '',
      MeasuringObjectId: '',
      ActuatorIds: [],
      StartTime: '',
      EndTime: ''
    },
    desc: '测量对象预览-平均/2σ数据'
  },
  {
    name: 'getMeasuringObjectHistoryData',
    method: 'POST',
    path: '/CFG/DataPreview/GetMeasuringObjectHistoryData',
    params: {
      ControllerId: '',
      MeasuringObjectId: '',
      StartTime: '',
      EndTime: ''
    },
    desc: '测量对象预览-历史数据'
  },
  {
    name: 'getHistoryDataByCV',
    method: 'POST',
    path: '/CFG/DataPreview/GetHistoryDataByCV',
    params: {
      ControllerId: '',
      MeasuringObjectId: '',
      ActuatorIds: [],
      StartTime: '',
      EndTime: ''
    },
    desc: '测量对象预览-历史数据-测量对象关联执行器历史数据'
  }
]