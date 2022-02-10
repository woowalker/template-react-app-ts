import { $consts } from 'src/plugins'

export default [
  {
    name: 'getOrgList',
    method: 'POST',
    path: '/OP/TenantInfo/GetOrgList',
    params: {
      Sort: 'CODE',
      Order: 0,
      Parameter10: window.location.host,
      Parameter11: '0'
    },
    axiosOptions: {
      noAttachedData: true
    },
    desc: '获取组织'
  },
  {
    name: 'getToken',
    method: 'POST',
    path: '/ENT/Token/Gen',
    params: {
      orgId: '',
      username: '',
      password: '',
      grant_type: 0,
      random: '',
      verificationCode: ''
    },
    axiosOptions: {
      noAttachedData: true,
      noCheckIsSuccessful: true,
      fullData: true
    },
    desc: '获取TOKEN'
  },
  {
    name: 'login',
    method: 'POST',
    path: '/ENT/Login/Login',
    params: {
      Parameter1: '',
      Parameter2: '',
      Parameter4: '',
      Parameter5: '',
      Parameter6: false,
      Parameter7: '',
      Parameter8: $consts['CONFIG/APP_CODE']
    },
    desc: '登录接口'
  },
  {
    name: 'getAllEnum',
    method: 'GET',
    path: '/OP/Extend/GetAllEnum',
    params: {},
    desc: '获取所有枚举'
  }
]