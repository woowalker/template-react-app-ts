import React, { useState, useMemo } from 'react'
import { Modal, Button } from 'antd'
import { omit } from 'lodash'

type Props = {
  disabled?: boolean,
  fullModal?: boolean,
  slot: React.ReactNode,
  slotClass?: string,
  slotStyle?: Object,
  [propName: string]: any
}

const ModalContext = React.createContext<any>(undefined)
const EasyModal = (props: Props) => {
  const [visible, setVisible] = useState(false)

  const handleShowModal = () => {
    !props.disabled && setVisible(true)
  }

  const handleOk = () => {
    if (props.onOk instanceof Function) {
      const promise = props.onOk()
      if (promise instanceof Promise) {
        promise.then(() => {
          setVisible(false)
        })
      } else {
        setVisible(!!promise)
      }
      return
    }
    setVisible(false)
  }

  const handleCancel = () => {
    props.onCancel instanceof Function && props.onCancel()
    setVisible(false)
  }

  const contextValue = useMemo(() => {
    return {
      show: () => setVisible(true),
      close: () => setVisible(false)
    }
  }, [])

  const { fullModal, slot, slotClass, slotStyle } = props
  const modalProps = omit(props, ['className', 'disabled', 'slot', 'slotStyle', 'slotClass', 'children'])
  return (
    <React.Fragment>
      <div onClick={handleShowModal} className={slotClass} style={slotStyle}>{slot}</div>
      <Modal
        {...modalProps}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        className={`${props.className} ${fullModal ? 'full-height' : ''}`}
      >
        <ModalContext.Provider value={contextValue}>
          {props.children}
        </ModalContext.Provider>
      </Modal>
    </React.Fragment>
  )
}

EasyModal.defaultProps = {
  destroyOnClose: true,
  title: '基本弹框',
  width: '80%',
  footer: null,
  // 自定义 props
  disabled: false,
  fullModal: false,
  slot: <Button>按钮</Button>,
  slotClass: 'form-modal__slot',
  slotStyle: { display: 'inline-block', cursor: 'pointer' }
}

export { ModalContext }
export default EasyModal