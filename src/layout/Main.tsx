import { useMemo } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import Header from './Header'
import { $consts } from 'src/plugins'
import 'src/styles/layout/main.less'

const Main = (props: any) => {
  const location = useLocation()

  const matchLogin = useMemo(() => {
    return matchPath(location.pathname, {
      path: $consts['ROUTE/LOGIN'],
      exact: true,
      strict: true
    })
  }, [location.pathname])

  return (
    <div className={`main ${matchLogin ? 'float' : ''}`}>
      <div className='main__header'><Header /></div>
      <div className='main__body full-width'>
        <div className='main__body-content'>{props.children}</div>
      </div>
    </div>
  )
}

export default Main