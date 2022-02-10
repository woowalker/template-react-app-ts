import { $consts } from 'src/plugins'
import { random } from 'lodash'

const RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

function replacePlaceholders (placeholder?: string) {
  let value = random(15)
  // eslint-disable-next-line no-mixed-operators
  value = placeholder === 'x' ? value : (value & 0x3 | 0x8)
  return value.toString(16)
}

export function uuid () {
  return RFC4122_TEMPLATE.replace(/[xy]/g, replacePlaceholders)
}

/**
 * 获取菜单树第一层级的最叶子菜单进行渲染
 * @param tree 菜单树
 * @returns 
 */
export function getFirstValidTree (tree: any): any {
  if (Array.isArray(tree.Children) && tree.Children.length) {
    return getFirstValidTree(tree.Children[0])
  }
  return tree.Node.ID
}

/**
 * 拍平菜单树
 * @param menus 菜单树
 * @param parentMenu 方法内部变量，可传 undefined
 * @param flatMenus 需要生成的一维菜单
 */
export function recurseMenu (menus: any, parentMenu: any = {}, flatMenus: any = []) {
  menus.forEach((menu: any) => {
    const { Node: Menu, Children: ChildMenus } = menu
    menu.Menu = Menu
    menu.ChildMenus = ChildMenus
    Menu.idLevels = (parentMenu.idLevels || []).concat(Menu.ID)
    Menu.nameLevels = (parentMenu.nameLevels || []).concat(Menu.NAME)
    Menu.menuLevels = (parentMenu.menuLevels || []).concat(Menu.MENU_LEVEL)
    Menu.childMenuLevels = (parentMenu.childMenuLevels || []).concat([ChildMenus])
    flatMenus.push(Menu)
    ChildMenus && ChildMenus.length && recurseMenu(ChildMenus, Menu, flatMenus)
  })
}

/**
 * 根据相对接口地址获取当前环境下对应的基础地址
 * @param path 相对接口地址
 * @param prefixPath 接口分割符
 * @returns 
 */
export function getBaseURL (path: string, prefixPath: string = $consts['CONFIG/API_PREFIX_PATH']) {
  // 获取接口上下文环境，例如：'http://192.168.2.98'
  const { hostname } = window.location
  const processEnv = $consts['CONFIG/PROCESS_ENVS'].find((env: any) => env.value.indexOf(hostname) !== -1) || { name: 'PRODUCTION_BASE' }
  const rootURL = $consts['CONFIG/AXIOS_BASE_URLS'].find((base: any) => base.name === processEnv.name).value
  // 如果 rootURL 本身就带端口了，那么拼接 rootURL 和 perfixPath
  const index = rootURL.lastIndexOf(':')
  if (index !== -1) {
    const port = rootURL.substring(index + 1)
    if (port && !isNaN(port)) {
      return `${rootURL}${prefixPath}`
    }
  }
  // 根据接口路径获取端口并与预设api前缀拼接，例如：':3002/api'
  const findModule = Object.keys($consts['CONFIG/API_PORT']).find(key => path.indexOf(key) !== -1)
  const prefixUrl = `:${findModule ? $consts['CONFIG/API_PORT'][findModule] : $consts['CONFIG/API_PORT'].all}${prefixPath}`
  // 得到baseURL，例如：'http://192.168.2.98:3002/api'
  return `${rootURL}${prefixUrl}`
}

/**
 * 获取当前环境下对应的 WebSocket 地址
 * @returns 
 */
export function getSocketURL () {
  const { hostname } = window.location
  const processEnv = $consts['CONFIG/PROCESS_ENVS'].find((env: any) => env.value.indexOf(hostname) !== -1) || { name: 'PRODUCTION_BASE' }
  return $consts['CONFIG/SOCKET_URLS'].find((base: any) => base.name === processEnv.name).value
}

/**
 * 用于判断非0或false的空值
 * @param val 
 * @returns 
 */
export function isEmpty (val: any) {
  return !val && val !== 0 && val !== false
}
