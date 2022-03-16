import React, { useState, useEffect } from 'react'
import { autorun } from 'mobx'
import { matchPath } from 'react-router-dom'
import { commonStore } from 'src/stores'
import { FormPage } from 'src/components'
import { Notice } from 'src/modules/main/components'
import { $consts } from 'src/plugins'

const FakePage = () => {
  return null
}

const Main = (props: any) => {
  const [formCode, setFormCode] = useState('')

  useEffect(() => autorun(() => {
    const matchMenu = matchPath<any>(props.location.pathname, {
      path: $consts['ROUTE/MAIN'],
      exact: true,
      strict: true
    })
    const find = commonStore.flatMenus.find((item: any) => item.ID === matchMenu?.params?.menuId)
    find && setFormCode(find.Nav_MenuForm?.CODE)
  }), [props.location.pathname])

  if (!formCode) {
    return <FakePage />
  }

  return (
    <React.Fragment>
      <FormPage formCode={formCode} />
      <Notice />
    </React.Fragment>
  )
}

export default Main