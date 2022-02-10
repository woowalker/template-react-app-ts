import React, { useState, useEffect, useMemo } from 'react'
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons'
import 'src/styles/components/common/collapseZone.less'

type Props = {
  children: any,
  collapse: any,
  visible?: boolean,
  onChange?: Function,
  showHandler?: boolean,
  expandSize?: string,
  collapseSize?: string,
  zoneClass?: string,
  zoneStyle?: Object,
  zoneLeftClass?: string,
  zoneLeftStyle?: Object,
  zoneRightClass?: string,
  zoneRightStyle?: Object
}
const CollpaseZone = (props: Props) => {
  const [visible, setVisible] = useState<boolean | undefined>(false)
  useEffect(() => {
    setVisible(prev => prev === props.visible ? prev : props.visible)
  }, [props.visible])
  useEffect(() => {
    props.onChange instanceof Function && props.onChange(visible)
  }, [visible])

  const sizeStyle = useMemo(() => {
    const { expandSize = '270px', collapseSize = '0px' } = props
    return {
      left: visible ? `calc(100% - ${expandSize})` : `calc(100% - ${collapseSize})`,
      right: visible ? expandSize : collapseSize
    }
  }, [visible, props.expandSize, props.collapseSize])

  const { showHandler = true, zoneClass, zoneStyle, zoneLeftClass, zoneLeftStyle, zoneRightClass, zoneRightStyle } = props
  return (
    <div className={`collapse-zone ${zoneClass}`} style={zoneStyle}>
      <div className={`collapse-zone__left ${zoneLeftClass}`} style={{ ...zoneLeftStyle, width: sizeStyle.left }}>
        {props.children}
      </div>
      <div className={`collapse-zone__right ${zoneRightClass}`} style={{ ...zoneRightStyle, width: sizeStyle.right }}>
        {props.collapse}
        {
          showHandler
            ? (
              <div onClick={() => setVisible(!visible)} className='collapse-zone__right-collapse'>
                {visible ? <CaretRightOutlined style={{ fontSize: 24 }} /> : <CaretLeftOutlined style={{ fontSize: 24 }} />}
              </div>
            )
            : null
        }
      </div>
    </div>
  )
}

export default CollpaseZone