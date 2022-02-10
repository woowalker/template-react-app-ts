import { $consts, $evt } from 'src/plugins'
import { isEmpty } from 'src/utils/tools'

/**
 * 表单配置 动态加载js，比如配置成：readme，
 * 那么就命名一个 readme.ts 的文件，
 * 将其配置成 $const['DYNAMICJS/README']:
 * {
 *    name: 'README',
 *    value: require('src/components/root/dynamicJs/readme').default
 * }
 * 然后在对应的控件配置里，配置 readme.ts 文件中的方法名，
 * 最后控件在 onChange 事件中会检测是否配置了动态加载的 js 文件，
 * 如果配置了，那么就执行相对应的方法名，该方法需要在 动态加载的 js 文件中配置，
 * 比如：LEFT_VAR_ID_DISABLE 这个就是配置在控件中的方法名，控件 onChange 就会执行该方法
 * 注意：方法对应的传参，需要到具体的控件中去查看
 */
export default {
  // 左边距源点禁用
  LEFT_VAR_ID_DISABLE (EditContext: any) {
    const { formBase, setFormBase, verifyWhiteList, setVerifyWhiteList } = EditContext
    const { LEFT_DISTANCE } = formBase
    if (!isEmpty(LEFT_DISTANCE)) {
      // 更新基础数据
      setFormBase({ ...formBase, LEFT_VAR_ID: undefined })
      // 因为 LEFT_VAR_ID 被禁用了，所以将 LEFT_VAR_ID 加入白名单
      setVerifyWhiteList([...verifyWhiteList, 'LEFT_VAR_ID'])
      $evt.emit($consts['COMMON/EVT_DISABLE_CONTROL'], 'LEFT_VAR_ID')
    } else {
      // 恢复白名单
      const findIndex = verifyWhiteList.findIndex((item: string) => item === 'LEFT_VAR_ID')
      if (findIndex !== -1) {
        verifyWhiteList.splice(findIndex, 1)
        setVerifyWhiteList([...verifyWhiteList])
      }
      $evt.emit($consts['COMMON/EVT_ENABLE_CONTROL'], 'LEFT_VAR_ID')
    }
  },
  // 左边距禁用
  LEFT_DISTANCE_DISABLE (EditContext: any) {
    const { formBase, setFormBase, verifyWhiteList, setVerifyWhiteList } = EditContext
    const { LEFT_VAR_ID } = formBase
    if (LEFT_VAR_ID) {
      // 更新基础数据
      setFormBase({ ...formBase, LEFT_DISTANCE: undefined })
      // 因为 LEFT_VAR_ID 被禁用了，所以将 LEFT_VAR_ID 加入白名单
      setVerifyWhiteList([...verifyWhiteList, 'LEFT_DISTANCE'])
      $evt.emit($consts['COMMON/EVT_DISABLE_CONTROL'], 'LEFT_DISTANCE')
    } else {
      // 恢复白名单
      const findIndex = verifyWhiteList.findIndex((item: string) => item === 'LEFT_DISTANCE')
      if (findIndex !== -1) {
        verifyWhiteList.splice(findIndex, 1)
        setVerifyWhiteList([...verifyWhiteList])
      }
      $evt.emit($consts['COMMON/EVT_ENABLE_CONTROL'], 'LEFT_DISTANCE')
    }
  },
  // 右边距源点禁用
  RIGHT_VAR_ID_DISABLE (EditContext: any) {
    const { formBase, setFormBase, verifyWhiteList, setVerifyWhiteList } = EditContext
    const { RIGHT_DISTANCE } = formBase
    if (!isEmpty(RIGHT_DISTANCE)) {
      // 更新基础数据
      setFormBase({ ...formBase, RIGHT_VAR_ID: undefined })
      // 因为 LEFT_VAR_ID 被禁用了，所以将 LEFT_VAR_ID 加入白名单
      setVerifyWhiteList([...verifyWhiteList, 'RIGHT_VAR_ID'])
      $evt.emit($consts['COMMON/EVT_DISABLE_CONTROL'], 'RIGHT_VAR_ID')
    } else {
      // 恢复白名单
      const findIndex = verifyWhiteList.findIndex((item: string) => item === 'RIGHT_VAR_ID')
      if (findIndex !== -1) {
        verifyWhiteList.splice(findIndex, 1)
        setVerifyWhiteList([...verifyWhiteList])
      }
      $evt.emit($consts['COMMON/EVT_ENABLE_CONTROL'], 'RIGHT_VAR_ID')
    }
  },
  // 右边距禁用
  RIGHT_DISTANCE_DISABLE (EditContext: any) {
    const { formBase, setFormBase, verifyWhiteList, setVerifyWhiteList } = EditContext
    const { RIGHT_VAR_ID } = formBase
    if (RIGHT_VAR_ID) {
      // 更新基础数据
      setFormBase({ ...formBase, RIGHT_DISTANCE: undefined })
      // 因为 LEFT_VAR_ID 被禁用了，所以将 LEFT_VAR_ID 加入白名单
      setVerifyWhiteList([...verifyWhiteList, 'RIGHT_DISTANCE'])
      $evt.emit($consts['COMMON/EVT_DISABLE_CONTROL'], 'RIGHT_DISTANCE')
    } else {
      // 恢复白名单
      const findIndex = verifyWhiteList.findIndex((item: string) => item === 'RIGHT_DISTANCE')
      if (findIndex !== -1) {
        verifyWhiteList.splice(findIndex, 1)
        setVerifyWhiteList([...verifyWhiteList])
      }
      $evt.emit($consts['COMMON/EVT_ENABLE_CONTROL'], 'RIGHT_DISTANCE')
    }
  }
}