import { makeObservable, observable, runInAction } from 'mobx'
import { $consts } from 'src/plugins'
import storage from 'localforage'
import { recurseMenu } from 'src/utils/tools'
import { cloneDeep } from 'lodash'

type Headers = {
  Authorization: string,
  Tenant: string,
  RootOrgId: string,
  orgId: string,
  userid: string,
  username: string
}

type LoginModel = {
  username: string,
  password: string,
  orgId: string
}

type RequestPayload = {
  OrgRule: Array<string>,
  DataRule: Array<string>
}

type UserInfo = {
  ID: string,
  ORG_ID: string,
  NAME: string,
  [propName: string]: any
}

type BaseConfig = {
  ID: string,
  CODE: string,
  NAME: string,
  [propName: string]: any
}

const initHeaders = { Authorization: 'Bearer ', Tenant: '', RootOrgId: '', orgId: '', userid: '', username: '' }
const initLoginModel = { username: '', password: '', orgId: '' }
const initRequestPayload = { OrgRule: [], DataRule: [] }
const initUserinfo = { ID: '', ORG_ID: '', NAME: '' }
const initBaseConfig = { ID: '', CODE: '', NAME: '' }
class CommonStore {
  /**
   * 将初始化的步骤移动到 constructor 中，
   * 并且请务必初始化，否则 babel 插件 plugin-transform-flow-strip-types 编译失败，
   * 相关联 issue: 
   * https://github.com/react-navigation/react-navigation/issues/5825#issuecomment-590723220
   * https://github.com/facebook/react-native/issues/20150#issuecomment-417858270
   */
  headers: Headers
  loginModel: LoginModel
  requestPayload: RequestPayload
  userinfo: UserInfo
  baseConfig: BaseConfig
  menus: Array<any>
  flatMenus: Array<any>
  initCacheDone: boolean

  constructor () {
    this.headers = initHeaders
    this.loginModel = initLoginModel
    this.requestPayload = initRequestPayload
    this.userinfo = initUserinfo
    this.baseConfig = initBaseConfig
    this.menus = [] // 菜单
    this.flatMenus = [] // 一维菜单
    this.initCacheDone = false

    makeObservable(this, {
      userinfo: observable,
      baseConfig: observable,
      menus: observable,
      flatMenus: observable
    })
    this.initCache()
  }

  initCache () {
    return Promise.all([
      storage.getItem($consts['STORAGE/CACHE_HEADERS']),
      storage.getItem($consts['STORAGE/CACHE_LOGIN_MODEL'])
    ]).then(datas => {
      const [headers, loginModel] = datas as any
      this.headers = headers || initHeaders
      this.loginModel = loginModel || initLoginModel
      this.initCacheDone = true
      return { headers: this.headers, loginModel: this.loginModel }
    })
  }

  storeCache () {
    return Promise.all([
      storage.setItem($consts['STORAGE/CACHE_HEADERS'], this.headers),
      storage.setItem($consts['STORAGE/CACHE_LOGIN_MODEL'], this.loginModel)
    ])
  }

  resetCache () {
    this.headers = initHeaders
    this.loginModel = initLoginModel
    this.requestPayload = initRequestPayload
    runInAction(() => {
      this.userinfo = initUserinfo
      this.baseConfig = initBaseConfig
      this.menus = []
      this.flatMenus = []
    })
    this.initCacheDone = false
    storage.clear()
  }

  getLoginModel () {
    return new Promise((resolve) => {
      if (this.initCacheDone) {
        resolve(this.loginModel)
      } else {
        this.initCache().then(res => {
          resolve(res.loginModel)
        })
      }
    })
  }

  getRequestParams () {
    return new Promise((resolve) => {
      if (this.initCacheDone) {
        resolve({
          headers: this.headers,
          userinfo: this.userinfo,
          requestPayload: this.requestPayload
        })
      } else {
        this.initCache().then(res => {
          resolve({
            headers: res.headers,
            userinfo: this.userinfo,
            requestPayload: this.requestPayload
          })
        })
      }
    })
  }

  setOrgInfo (data: any) {
    const { Tenant = '', Data = [] } = data
    this.headers = {
      ...this.headers,
      Tenant,
      RootOrgId: Data[0]?.Node?.ID || ''
    }
    this.storeCache()
  }

  setAccessToken (token: any) {
    const { access_token, token_type } = token
    this.headers = {
      ...this.headers,
      Authorization: `${token_type} ${access_token}`
    }
    this.storeCache()
  }

  setLoginData (data: any, loginModel?: LoginModel) {
    const { BaseConfig, DataRule, OrgRule, User, Menus } = data
    const { ID: userid, CODE: username, ORG_ID: orgId } = User
    // 存储相关数据
    this.headers = { ...this.headers, userid, username, orgId }
    this.loginModel = { ...this.loginModel, ...loginModel }
    this.storeCache()
    // 请求相关参数
    this.requestPayload = { ...this.requestPayload, DataRule, OrgRule }
    // 拍平菜单树
    const flatMenus: any = []
    const copyMenus = cloneDeep(Menus)
    recurseMenu(copyMenus, undefined, flatMenus)

    runInAction(() => {
      this.userinfo = User
      this.baseConfig = BaseConfig
      this.menus = copyMenus
      this.flatMenus = flatMenus
    })
  }
}

const commonStore = new CommonStore()

export default commonStore