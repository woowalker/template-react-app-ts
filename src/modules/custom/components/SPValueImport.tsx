import React, { useState, useContext } from 'react'
import { ModalContext } from 'src/components'
import { Form, Input, Button, Upload, message } from 'antd'
import axios from 'axios'
import { $api } from 'src/plugins'
import { getBaseURL } from 'src/utils/tools'

type Props = {
  controlId: string | number,
  actuatorId: string,
  onSuccess: Function
}

const actionApi = 'CFG/ControllerMonitor/ImportSPValue'

const SPValueImport = (props: Props) => {
  // 表单数据
  const [formBase, setFormBase] = useState<any>({
    SPValue: '', // 预设值
    file: '', // 上传的文件
  })

  // 上传的文件
  const handleUpload = (file: any) => {
    setFormBase({ ...formBase, file })
    return false
  }

  // form 表单验证状态
  const [verify, setVerify] = useState<any>({})
  const validateForm = () => {
    !formBase.SPValue && !formBase.file ? (verify.required = 'error') : (verify.required = undefined)
    setVerify({ ...verify })
    return !formBase.SPValue && !formBase.file
  }

  // 弹框
  const modal = useContext(ModalContext)
  const handleOk = () => {
    if (validateForm()) return

    if (formBase.file) {
      const file: any = new FormData()
      file.append('file', formBase.file)
      file.append('ControllerId', props.controlId)
      file.append('ActuatorId', props.actuatorId)
      axios({
        url: `${getBaseURL(actionApi)}/${actionApi}`,
        method: 'POST',
        data: file
      }).then((res: any) => {
        if (res) {
          message.success('操作成功')
          props.onSuccess()
          handleCancel()
        }
      })
      return
    }

    $api['controlmonitor/setSPValue']({
      ControllerId: props.controlId,
      ActuatorId: props.actuatorId,
      SPValue: formBase.SPValue
    }).then((res: any) => {
      if (res) {
        message.success('操作成功')
        props.onSuccess()
        handleCancel()
      }
    })
  }
  const handleCancel = () => {
    modal.close()
  }

  return (
    <React.Fragment>
      <Form layout='horizontal' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label='预设值' validateStatus={verify.required}>
          <Input
            disabled={formBase.file}
            value={formBase.SPValue}
            onChange={evt => setFormBase({ ...formBase, SPValue: evt.target.value })}
            addonAfter='单位'
          />
        </Form.Item>
        <Form.Item label='导入' validateStatus={verify.required}>
          <div className='display-flex'>
            <Input
              readOnly
              allowClear
              disabled={formBase.SPValue}
              value={formBase.file?.name}
              className='flex-1'
            />
            <Upload
              showUploadList={false}
              maxCount={1}
              beforeUpload={handleUpload}
              disabled={formBase.SPValue}
            >
              <Button type='primary' disabled={formBase.SPValue} style={{ marginLeft: 8 }}>选择</Button>
            </Upload>
            {formBase.file ? <Button type='primary' onClick={() => setFormBase({ ...formBase, file: '' })} className='mg-l4'>重置</Button> : null}
          </div>
        </Form.Item>
      </Form>
      <div className='ant-modal-footer'>
        <Button onClick={handleCancel}>取消</Button>
        <Button type='primary' onClick={handleOk}>确定</Button>
      </div>
    </React.Fragment>
  )
}

export default SPValueImport