import { useState, useMemo } from 'react'
import { useHistory, useLocation, matchPath } from 'react-router-dom'
import { observer } from 'mobx-react'
import { Dropdown, Menu } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { EnergyIcon } from 'src/components'
import { commonStore } from 'src/stores'
import { $consts } from 'src/plugins'
import 'src/styles/layout/header.less'

const { SubMenu } = Menu

// 个人中心
const User = () => {
  const history = useHistory()

  const [visible, setVisible] = useState(false)

  const handleLogout = () => {
    commonStore.resetCache()
    history.push($consts['ROUTE/LOGIN'])
  }

  const handleUserMenuClick = (evt: any) => {
    switch (evt.key) {
      case 'user-menu-logout':
        handleLogout()
        break
      default:
        break
    }
    setVisible(false)
  }

  const { userinfo } = commonStore
  return (
    <Dropdown
      visible={visible}
      onVisibleChange={setVisible}
      overlay={
        <Menu onClick={handleUserMenuClick}>
          <Menu.Item key='user-menu-userinfo'>当前登录：{userinfo.NAME}</Menu.Item>
          <Menu.Item key='user-menu-logout'>退出登录</Menu.Item>
        </Menu>
      }
    >
      <span className='header__right-user'>
        <UserOutlined className='header__right-icon' />
      </span>
    </Dropdown>
  )
}
const HeaderUser = observer(User)

// 顶部菜单
const Menus = () => {
  const history = useHistory()
  const location = useLocation()

  const handleClick = (evt: any) => {
    const { flatMenus } = commonStore
    const menu = flatMenus.find((item: any) => item.ID === evt.key)
    menu && history.push({
      pathname: `/main/${menu.ID}`,
      search: location.search
    })
  }

  const generateMenus = (menu: any, index: number) => {
    if (Array.isArray(menu.Children) && menu.Children.length) {
      return (
        <SubMenu
          key={`${menu.Node.ID}_${index}`}
          title={
            <span className="submenu-title-wrapper">
              <EnergyIcon allowBlank type={menu.ICON} />
              <span>{menu.Node.NAME}</span>
            </span>
          }
        >
          {
            menu.Children.map((childMenu: any, childIndex: number) => {
              return generateMenus(childMenu, childIndex)
            })
          }
        </SubMenu>
      )
    }
    return (
      <Menu.Item key={menu.Node.ID}>
        <EnergyIcon allowBlank type={menu.ICON} />
        <span>{menu.Node.NAME}</span>
      </Menu.Item>
    )
  }

  const matchMain = useMemo<any>(() => {
    return matchPath(location.pathname, {
      path: $consts['ROUTE/MAIN'],
      exact: true,
      strict: true
    })
  }, [location.pathname])

  return (
    <Menu
      onClick={handleClick}
      selectedKeys={[matchMain?.params?.menuId]}
      mode='horizontal'
      className='header__left-menus'
    >
      {commonStore.menus.map((menu: any, index: number) => generateMenus(menu, index))}
    </Menu>
  )
}
const HeaderMenus = observer(Menus)

const Header = () => {
  const location = useLocation()

  const matchLogin = useMemo<any>(() => {
    return matchPath(location.pathname, {
      path: $consts['ROUTE/LOGIN'],
      exact: true,
      strict: true
    })
  }, [location.pathname])

  const { baseConfig } = commonStore
  return (
    <div className={`header ${matchLogin ? 'login' : ''}`}>
      <div className='header__left'>
        <img src={require('../assets/layout/header-logo.png').default} alt='' className='header__left-logo' />
        <span className='header__left-slogan'>{baseConfig.SYS_NAME}</span>
        {!matchLogin ? <HeaderMenus /> : null}
      </div>
      {
        !matchLogin
          ? (
            <div className='header__right'>
              <HeaderUser />
            </div>
          )
          : null
      }
    </div>
  )
}

export default observer(Header)