import { useState, useEffect } from 'react'
import { LoadablePage } from 'src/components'
import { commonStore } from 'src/stores'
import { $api } from 'src/plugins'
import { initFilter } from 'src/utils/common'

type Props = {
  formCode: string
}

const CustomPage = (props: Props) => {
  const [formState, setFormState] = useState()

  useEffect(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const payload = initFilter({ OrgId, Keyword: props.formCode })
    $api['app/getCustomPageConfigInfo'](payload).then((res: any) => {
      res && setFormState(res)
    })
  }, [props.formCode])


  if (!formState) return null

  const { Nav_PageCustom = {} } = formState as any
  return <LoadablePage name={Nav_PageCustom.COMPONENT_NAME} />
}

export default CustomPage