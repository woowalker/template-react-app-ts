export default [
  {
    name: 'getTablePageConfigInfo',
    method: 'POST',
    path: '/OP/PageTable/GetTablePageConfigInfo',
    params: {},
    axiosOptions: {
      noPickParams: true
    },
    desc: '获取 form 对应的 tables 表格的配置信息'
  },
  {
    name: 'getTablePageTables',
    method: 'POST',
    path: '/OP/PageTable/GetTablePageTables',
    params: {},
    axiosOptions: {
      noPickParams: true
    },
    desc: '获取 form 对应的列表表单配置'
  }
]