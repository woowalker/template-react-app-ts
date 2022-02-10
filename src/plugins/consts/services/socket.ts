export default [
  {
    name: 'LOGIN',
    value: 'P0001'
  },
  {
    name: 'VALID_MSGLIST_TYPECODE',
    value: ['M0001']
  },
  // 半闭环消息列表
  {
    name: 'LOOP_LIST',
    value: 'M0001'
  },
  // 半闭环写入或放弃
  {
    name: 'LOOP_READ',
    value: 'M0002'
  },
  // 控制器监测写入成功的消息
  {
    name: 'ACTUATOR_WRITE',
    value: 'M0003'
  },
  // 页面刷新
  {
    name: 'PAGE_REFRESH',
    value: 'M0004'
  }
]