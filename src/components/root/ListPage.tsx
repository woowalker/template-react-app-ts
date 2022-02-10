import React, { useState, useMemo, useRef } from 'react'
import { Title, LoadableButton, ListTable } from 'src/components'
import { $consts } from 'src/plugins'
import 'src/styles/components/root/listPage.less'

type Props = {
  formCode: string
}

const ListContext = React.createContext<any>(undefined)
const ListPage = (props: Props) => {
  const [tableConfig, setTableConfig] = useState<any>()

  const handleLoadedData = (tableData: any) => {
    setTableConfig(tableData.config)
  }

  const headerBtns = useMemo(() => {
    return tableConfig?.Btns || []
  }, [tableConfig])

  const refOfTable = useRef()
  return (
    <ListContext.Provider value={refOfTable.current}>
      <div className='list-page'>
        {
          headerBtns.length
            ? (
              <div className='list-page__header'>
                {headerBtns.map((btn: any) => <LoadableButton key={btn.ID} pageType={$consts['TABLE/FORM_TYPE_LIST_PAGE']} config={btn} />)}
              </div>
            )
            : null
        }
        <div className='list-page__table'>
          <Title title={tableConfig?.Nav_Form?.NAME || '基础表格'} className='mg-b18' />
          <ListTable
            onRef={(ref: any) => refOfTable.current = ref}
            formCode={props.formCode}
            onLoadedData={handleLoadedData}
          />
        </div>
      </div>
    </ListContext.Provider>
  )
}

export { ListContext }
export default ListPage