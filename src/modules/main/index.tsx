import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { matchPath } from 'react-router-dom'
import { commonStore, appStore } from 'src/stores'
import { FormPage } from 'src/components'
import { Notice } from 'src/modules/main/components'
import { $api, $consts } from 'src/plugins'

const FakePage = () => {
  return null
}

const Main = (props: any) => {
  const [loginModel, setLoginModel] = useState()

  useEffect(() => {
    commonStore.getLoginModel()
      .then((model: any) => {
        const { orgId } = model
        if (orgId) {
          setLoginModel(model)
        } else {
          props.history.push($consts['ROUTE/LOGIN'])
        }
      })
  }, [])

  useEffect(() => {
    const { ORG_ID } = commonStore.userinfo
    if (loginModel && !ORG_ID) {
      const { username, password, orgId } = loginModel
      $api['common/login']({
        Parameter1: username,
        Parameter2: password,
        Parameter4: orgId
      }).then((res: any) => {
        if (res) {
          commonStore.setLoginData(res)
          $api['common/getAllEnum']()
        }
      })
    }
  }, [loginModel])

  useEffect(() => {
    const matchMenu = matchPath<any>(props.location.pathname, {
      path: $consts['ROUTE/MAIN'],
      exact: true,
      strict: true
    })
    if (matchMenu?.params?.menuId !== appStore.activeMenu?.ID) {
      const find = commonStore.flatMenus.find((item: any) => item.ID === matchMenu?.params?.menuId)
      find && appStore.setActiveMenu(find)
    }
  }, [props.location.pathname])

  if (!appStore.activeMenu?.Nav_MenuForm?.CODE) {
    return <FakePage />
  }

  return (
    <React.Fragment>
      <FormPage formCode={appStore.activeMenu.Nav_MenuForm.CODE} />
      <Notice />
    </React.Fragment>
  )
}

export default observer(Main)