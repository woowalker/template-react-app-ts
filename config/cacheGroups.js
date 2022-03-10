function getTestPath (module, name) {
  const path = require('path')
  return module.resource && module.resource.includes(`${path.sep}${name}${path.sep}`)
};

/**
 * 实测需要指定 chunks 分包方式，否则该 cacheGroup 不生效，
 * 某些 cacheGroup chunks 指定为 async 时，会拆不出来，这时候就要根据实际情况，设定为 initail 或者 all
 * 有时 initial 也拆不出来，这时候就要设定 enforce 为 true，强制 webpack 将包拆出来
 */
const cacheGroups = {
  react: {
    name: 'react',
    chunks: 'all',
    test: /[\\/]node_modules[\\/]((react).*)[\\/]/,
    enforce: true
  },
  rccomponent: {
    name: 'rccomponent',
    chunks: 'initial',
    test: /[\\/]node_modules[\\/]((rc-).*)[\\/]/,
    enforce: true
  },
  antd: {
    name: 'antd',
    chunks: 'initial',
    test: /[\\/]node_modules[\\/]((antd|@ant-design).*)[\\/]/,
    enforce: true
  },
  echarts: {
    name: 'echarts',
    chunks: 'initial',
    test (module) {
      return getTestPath(module, 'echarts')
    }
  },
  lodash: {
    name: 'lodash',
    chunks: 'initial',
    test (module) {
      return getTestPath(module, 'lodash')
    },
    enforce: true
  },
  moment: {
    name: 'moment',
    chunks: 'initial',
    test (module) {
      return getTestPath(module, 'moment')
    },
    enforce: true
  },
  zrender: {
    name: 'zrender',
    chunks: 'initial',
    test (module) {
      return getTestPath(module, 'zrender')
    },
    enforce: true
  },
}

module.exports = cacheGroups