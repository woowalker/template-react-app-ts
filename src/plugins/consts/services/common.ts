export default [
  // 时长
  {
    name: 'DURATION_COMMON',
    value: 200
  },
  {
    name: 'DURATION_FADE_IN',
    value: 200
  },
  {
    name: 'DURATION_ARROW_ROTATE',
    value: 200
  },
  // 存储
  {
    name: 'CACHE_HEADERS',
    value: 'cache_headers'
  },
  {
    name: 'CACHE_USERINFO',
    value: 'cache_userinfo'
  },
  {
    name: 'CACHE_MENUS',
    value: 'cache_menus'
  },
  {
    name: 'CACHE_DATARULE',
    value: 'cache_dataRule'
  },
  // 事件
  {
    name: 'EVENT_NAV_PAGE',
    value: 'event_nav_page'
  },
  {
    name: 'EVENT_SESSION_CHECK_DONE',
    value: 'event_session_check_done'
  },
  {
    // 控件禁用事件
    name: 'EVT_DISABLE_CONTROL',
    value: 'evt_disable_control'
  },
  {
    // 控件启用事件
    name: 'EVT_ENABLE_CONTROL',
    value: 'evt_enable_control'
  },
  // 正则
  {
    name: 'REG_PHONE',
    value: /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
  },
  {
    name: 'REG_IMAGE',
    value: /\.(png|jpg|gif|jpeg|webp)$/
  },
  // 密码登录
  {
    name: 'GRANT_TYPE_PASSWORD',
    value: 0
  },
  // 验证码登录
  {
    name: 'GRANT_TYPE_PHONECODE',
    value: 1
  },
  // token 刷新登录
  {
    name: 'GRANT_TYPE_REFRESH',
    value: 2
  },
  // 顶级菜单标志
  {
    name: 'TOP_MENU_LEVEL',
    value: 0
  },
  // 分页请求一页请求数
  {
    name: 'PAGINATION_LIMIT',
    value: 10
  }
]