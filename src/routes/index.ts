import React from 'react'
import { $consts } from 'src/plugins'

const Login = React.lazy(() => import('src/modules/login'))
const Main = React.lazy(() => import('src/modules/main'))

const routes = [
  {
    path: $consts['ROUTE/ROOT'],
    redirect: $consts['ROUTE/MAIN'],
    component: () => null
  },
  {
    path: $consts['ROUTE/LOGIN'],
    component: Login
  },
  {
    path: $consts['ROUTE/MAIN'],
    component: Main
  }
]

export default routes