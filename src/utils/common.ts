import { uniq } from 'lodash'

type Filter = {
  OrgId: string,
  Parameter1?: string | number,
  Parameter2?: string | number,
  Parameter3?: string | number,
  Parameter4?: string | number,
  Parameter5?: string | number,
  Parameter6?: string | number,
  Keyword?: string | number,
  Sort?: string | number,
  Order?: number,
  PageIndex?: number,
  Limit?: number,
  Start?: number,
  SelectField?: Array<any>
}

export function initFilter (init: Filter) {
  const {
    OrgId,
    Parameter1,
    Parameter2,
    Parameter3,
    Parameter4,
    Parameter5,
    Parameter6,
    Keyword = "",
    Sort,
    Order = 0,
    PageIndex = 1,
    Limit = 10,
    Start = ((init.PageIndex || 1) - 1) * (init.Limit || 10),
    SelectField = []
  } = init
  return {
    OrgId,
    Parameter1,
    Parameter2,
    Parameter3,
    Parameter4,
    Parameter5,
    Parameter6,
    Keyword,
    Sort,
    Order,
    PageIndex,
    Limit,
    Start,
    RuleCount: 0,
    IncludeCount: 0,
    OrderCount: 0,
    FilterGroupCount: 0,
    Include: [],
    Orders: [],
    FilterGroup: { Rules: [], Groups: [] },
    SelectField,
    DataRule: []
  }
}

/**
 * 获取单个 rule
 * @param Field 字段
 * @param Operate 操作符
 * @param Value 值
 * @param IsSysParamRule 系统规则
 * @returns 
 */
export function getSingleRule (Field: string, Operate: number, Value: number | string, IsSysParamRule?: boolean) {
  Value = Value === null ? '' : Value
  return {
    Field,
    Operate,
    Value: IsSysParamRule ? Value.toString() : Value,
    IsSysParamRule: !!IsSysParamRule
  }
}

/**
 * 扩展 FilterGroup.Rules 数组
 * @param target 
 * @param rules 
 */
export function extendRules (target: any, rules: any) {
  if (Array.isArray(target?.Rules)) {
    target.Rules = [].concat(target.Rules, rules)
  }
}

/**
 * 扩展 filter.Include 数组
 * @param target 
 * @param includes 
 */
export function extendInclude (target: any, includes: string[]) {
  if (Array.isArray(target?.Include)) {
    target.Include = uniq(([] as string[]).concat(target.Include, includes))
  }
}

/**
 * FilterGroup.Groups 对象
 * @param IsAnd 与条件
 * @returns 
 */
export function initGroup (IsAnd: boolean = true) {
  return {
    IsAnd,
    Rules: [],
    Groups: [],
  }
}

type Group = {
  isAnd: boolean,
  rules: Array<any>,
  childGroups: Array<any>,
  Groups: Array<any>
}

/**
 * 获取单个 FilterGroup.Groups 对象具体的 Rules 和 Groups
 * @param {Group} param0 
 * @param parentGroup FilterGroup.Groups 对象
 * @returns 
 */
export function getSingleGroup ({ isAnd, rules, childGroups }: Group, parentGroup?: Group) {
  const singleGroup = initGroup(isAnd)

  if (Array.isArray(rules) && rules.length) {
    const groupRules: any = []
    rules.forEach(({ field, operator, value, isSysParam }) => {
      groupRules.push(getSingleRule(field, operator, value, isSysParam))
    })
    extendRules(singleGroup, groupRules)
  }

  if (Array.isArray(childGroups) && childGroups.length) {
    childGroups.forEach(item => {
      getSingleGroup(item, parentGroup)
    })
  }

  parentGroup && parentGroup.Groups.push(singleGroup)

  return singleGroup
}

/**
 * 扩展 FilterGroup.Groups 数组
 * @param target 
 * @param groups 
 */
export function extendGroups (target: any, groups: any) {
  if (Array.isArray(target?.Groups)) {
    target.Groups = [].concat(target.Groups, groups)
  }
}

/**
 * target 添加 OrgType 或 MenuParameter，target.FilterGroup 添加 Rules 和 Groups
 * @param {Object} target 目标对象
 * @param {Object} target.FilterGroup
 * @param {Object} target.OrgType
 * @param {Object} target.MenuParameter
 * @param {Object} source
 * @param {Object} source.rules
 * @param {Object} source.groups
 * @param {Object} source.orgType
 * @param {Object} source.menuParameter
 */
type Target = {
  FilterGroup: Object,
  OrgType?: number | string,
  MenuParameter?: number | string,
  [propName: string]: any
}

type Source = {
  rules?: Array<any>,
  groups?: Array<any>,
  orgType?: number | string,
  menuParameter?: number | string
}

export function addRuleAndGroups (target: Target, source: Source = {}) {
  const { rules, groups, orgType, menuParameter } = source
  orgType && (target.OrgType = orgType)
  menuParameter && (target.MenuParameter = menuParameter)

  if (Array.isArray(rules) && rules.length) {
    // 自定义过滤规则
    const customRules = rules.filter(item => item.isCustom)
    customRules.forEach(({ field, value }) => {
      if (field.indexOf(',') !== -1) {
        const splitFileds = field.split(',')
        const splitValues = value.toString().split(',')
        splitFileds.forEach((n: any, i: number) => {
          target[n] = splitValues[i]
        })
      } else {
        target[field] = value
      }
    })

    // 过滤规则: pf001 -> 列表配置 -> 操作：过滤
    const commonRules = rules.filter(item => !item.isCustom)
    const FilterGroup_Rules: any = []
    commonRules.forEach(({ field, operator, value, isSysParam }) => {
      FilterGroup_Rules.push(getSingleRule(field, operator, value, isSysParam))
    })
    extendRules(target.FilterGroup, FilterGroup_Rules)
  }

  if (Array.isArray(groups) && groups.length) {
    const FilterGroup_Groups: any = []
    groups.forEach(item => {
      FilterGroup_Groups.push(getSingleGroup(item))
    })
    extendGroups(target.FilterGroup, FilterGroup_Groups)
  }
}