import axios from 'axios'
import interceptor from './interceptor'
import { AXIOS_DEFAULT_CONFIG } from './config'

const axiosIns = axios.create(AXIOS_DEFAULT_CONFIG)
axiosIns.interceptors.request.use(interceptor.reqSuccess, interceptor.reqFail)
axiosIns.interceptors.response.use(interceptor.resSuccess, interceptor.resFail)

const CancelToken = axios.CancelToken
export { CancelToken }
export default axiosIns