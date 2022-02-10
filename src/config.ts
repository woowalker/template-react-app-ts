const environment = [
  // 服务编码
  {
    name: 'SERVICE_CODE',
    value: 'CFG'
  },
  // 应用编码
  {
    name: 'APP_CODE',
    value: 'RTM'
  },
  // 不同接口路径对应不同端口
  {
    name: 'API_PORT',
    value: {
      all: 91
    }
  },
  {
    name: 'API_PREFIX_PATH',
    value: '/api'
  },
  // 不同环境对应不同 baseURL
  {
    name: 'AXIOS_BASE_URLS',
    value: [
      // 本地开发环境（MOCK接口地址）
      {
        name: 'LOCAL_BASE',
        value: 'http://81.71.34.35'
      },
      // 开发联调环境（后端开发服务器接口地址）
      {
        name: 'DEVELOPMENT_BASE',
        value: 'http://81.71.34.35'
      },
    ]
  },
  // 不同环境对应不同 socket 链接地址
  {
    name: 'SOCKET_URLS',
    value: [
      // 本地开发环境（MOCK接口地址）
      {
        name: 'LOCAL_BASE',
        value: 'ws://81.71.34.35:3110/'
      },
      // 开发联调环境（后端开发服务器接口地址）
      {
        name: 'DEVELOPMENT_BASE',
        value: 'ws://81.71.34.35:3110/'
      },
    ]
  },
  /**
   * 根据 hostname 判断对应运行环境，再根据不同环境获取到不同的 baseURL
   * name: AXIOS_BASE_URLS
   * value: hostname
   */
  {
    name: 'PROCESS_ENVS',
    value: [
      {
        name: 'LOCAL_BASE',
        value: ['localhost', '127.0.0.1']
      },
      {
        name: 'DEVELOPMENT_BASE',
        value: ['81.71.34.35']
      }
    ]
  }
]

export default environment