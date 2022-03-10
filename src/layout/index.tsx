import { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { commonStore } from 'src/stores'
import Main from './Main'
import { $api, $consts } from 'src/plugins'

const Layout = (props: any) => {
  const history = useHistory()

  const location = useLocation()
  useEffect(() => {
    if (location.pathname !== $consts['ROUTE/LOGIN']) {
      const toLogin = (loginModel: any) => {
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
            }
          })
        }
      }

      commonStore.getLoginModel()
        .then((model: any) => {
          const { orgId } = model
          if (orgId) {
            toLogin(model)
          } else {
            history.push($consts['ROUTE/LOGIN'])
          }
        })
    }
  }, [location.pathname])

  return <Main>{props.children}</Main>
}

export default Layout