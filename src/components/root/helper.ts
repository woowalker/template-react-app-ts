import { get } from 'lodash'
import { isEmpty } from 'src/utils/tools'

/**
 * 编辑表单 form 校验域
 * @param config 配置项配置
 * @param data formBase 需要提交的数据
 * @returns 
 */
export const verifyField = (config: any, data: any) => {
  const { REQUIRED, FIELD_NAME } = config
  const fieldValue = get(data, FIELD_NAME)
  return REQUIRED && isEmpty(fieldValue)
}

/**
 * 编辑表单子表的导航属性获取
 * @param subPages 编辑表单子表
 * @returns 
 */
export const getNavFields = (subPages: any[] = []) => {
  const navFields: string[] = []
  subPages.forEach((item: any) => {
    const { NavFields, Nav_Columns = [] } = item
    NavFields && navFields.push(NavFields)
    Nav_Columns.forEach((col: any) => {
      const { FIELD_NAME } = col
      const fields = FIELD_NAME.split('.')
      if (fields.length > 1) {
        fields.splice(fields.length - 1, 1)
        NavFields && fields.splice(0, 0, NavFields)
        navFields.push(fields.join('.'))
      }
    })
  })
  return navFields
}