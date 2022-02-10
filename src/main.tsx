import { Suspense } from 'react'
import {
  Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { history } from 'src/plugins'
import Layout from 'src/layout'
import routes from 'src/routes'
import 'src/utils/predayjs'
import 'src/styles/index.less'

// Suspense fallback 可以添加一个页面加载的 Loading 组件
const Main = () => {
  return (
    <Router history={history}>
      <Layout>
        <Switch>
          <Suspense fallback={<div />}>
            {
              routes.map((route, index) => {
                const { path, redirect, component: RouteComponent } = route
                return (
                  <Route
                    key={`${path}-${index}`}
                    exact
                    path={path}
                    render={routeProps => {
                      return redirect ? <Redirect to={redirect} /> : <RouteComponent {...routeProps} />
                    }}
                  />
                )
              })
            }
          </Suspense>
        </Switch>
      </Layout>
    </Router>
  )
}

export default Main