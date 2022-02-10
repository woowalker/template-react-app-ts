import { message } from 'antd'
import { CONSOLE_REQUEST_ENABLE, CONSOLE_RESPONSE_ENABLE } from './config'
import { loadingStore } from 'src/stores'
import { history, $consts } from 'src/plugins'
import { get } from 'lodash'

const reqSuccess = (reqObj: any) => {
  CONSOLE_REQUEST_ENABLE && console.info('request success', reqObj.url, reqObj)
  !reqObj.noShowLoading && loadingStore.show(undefined, reqObj.url)
  return reqObj
}

const reqFail = (err: any) => {
  return Promise.reject(err)
}

const resSuccess = ({ data, config }: any) => {
  CONSOLE_RESPONSE_ENABLE && console.log('response success', data, config)
  !config.noShowLoading && loadingStore.hide(undefined, config.url)
  if (!data.IsSuccessful && !config.noCheckIsSuccessful) {
    // 全局错误提示
    if (!config.noErrorToast) {
      message.error(data.ErrorMessage)
    }
    return Promise.reject(data)
  }
  return config.fullData ? data : data.Data
}

const resFail = (resErr: any) => {
  !resErr.config.noShowLoading && loadingStore.hide(undefined, resErr.config.url)
  if (resErr.response) {
    switch (resErr.response.status) {
      case 401: // 登录过期
        const { pathname } = history.location
        if (pathname !== $consts['ROUTE/LOGIN']) {
          // todo 重新登录
        }
        resErr.config.noErrorToast = true
        break
      default:
        resErr.message = get(resErr, 'response.data.error_description', '网络错误')
        break
    }
  } else {
    resErr.message = '网络错误'
  }

  // 超时提示
  if (resErr.message.includes('timeout')) {
    resErr.message = '请求超时'
  }

  // 全局错误提示
  if (!resErr.config.noErrorToast) {
    message.error(resErr.message)
  }

  return Promise.reject(resErr)
}

export default {
  reqSuccess,
  reqFail,
  resSuccess,
  resFail
}