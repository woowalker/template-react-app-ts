export default [
  {
    name: 'getByRedis',
    method: 'GET',
    path: '/OP/Form/GetByRedis',
    params: {
      Key: '',
      orgid: ''
    },
    desc: '获取表单配置'
  },
  {
    name: 'getCustomPageConfigInfo',
    method: 'POST',
    path: '/OP/PageCustom/GetCustomPageConfigInfo',
    params: {
      Keyword: '',
      OrgId: ''
    },
    desc: '获取自定义表单配置'
  },
  {
    name: 'getDataByPost',
    method: 'POST',
    path: '/',
    params: {},
    axiosOptions: {
      noPickParams: true
    },
    desc: '自定义URL请求的POST方法'
  },
  {
    name: 'getDataByGet',
    method: 'GET',
    path: '/',
    params: {},
    axiosOptions: {
      noPickParams: true
    },
    desc: '自定义URL请求的GET方法'
  },
  {
    name: 'orderPagedTwo',
    method: 'POST',
    path: '/VAR/Var/OrderPagedTwo',
    params: {},
    axiosOptions: {
      noPickParams: true,
      fullData: true
    },
    desc: '获取变量分页接口'
  }
]