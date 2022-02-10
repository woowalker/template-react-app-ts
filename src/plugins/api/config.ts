// axios 默认配置
export const AXIOS_DEFAULT_CONFIG = {
  timeout: 20000,
  maxContentLength: 2000,
  headers: {
    'Authorization': 'Bearer '
  }
}

export const API_DEFAULT_CONFIG = {
  // 修正路径，可用这个控制接口版本号，比如 /apiv2
  prefixPath: '/api',
  // this.$api['common/getUserInfo'] 中的 common/getUserInfo 分隔符，分割命名空间和接口
  sep: '/',
  // 是否开启接口 console 输出
  debug: false
}

// 开启请求参数打印
export const CONSOLE_REQUEST_ENABLE = false

// 开启响应参数打印
export const CONSOLE_RESPONSE_ENABLE = false