import React, { useState, useContext } from 'react'
import { ModalContext } from 'src/components'
import { Form, Input, Button, Checkbox, Upload, message } from 'antd'
import axios from 'axios'
import { $api } from 'src/plugins'
import { getBaseURL } from 'src/utils/tools'
import { pick } from 'lodash'

type Props = {
  controlId: string | number,
  mesuringObjectId: string,
  onSuccess: Function
}

const actionApi = 'CFG/ControllerMonitor/ImportTargetDeviation'

const TargetOffset = (props: Props) => {
  // 表单数据
  const [formBase, setFormBase] = useState<any>({
    Value: '', // 预设值
    File: '', // 上传的文件
    IsSaveController: false // 存入当前控制器
  })

  // 上传的文件
  const handleUpload = (file: any) => {
    setFormBase({ ...formBase, File: file })
    return false
  }

  // form 表单验证状态
  const [verify, setVerify] = useState<any>({})
  const validateForm = () => {
    !formBase.Value && !formBase.File ? (verify.required = 'error') : (verify.required = undefined)
    setVerify({ ...verify })
    return !formBase.Value && !formBase.File
  }

  // 弹框
  const modal = useContext(ModalContext)
  const handleOk = () => {
    if (validateForm()) return

    if (formBase.File) {
      const file: any = new FormData()
      file.append('File', formBase.File)
      file.append('IsSaveController', formBase.IsSaveController)
      file.append('ControllerId', props.controlId)
      file.append('MesuringObjectId', props.mesuringObjectId)
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

    $api['controlmonitor/setTargetDeviation']({
      ControllerId: props.controlId,
      MesuringObjectId: props.mesuringObjectId,
      ...pick(formBase, ['Value', 'IsSaveController'])
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
            disabled={formBase.File}
            value={formBase.Value}
            onChange={evt => setFormBase({ ...formBase, Value: evt.target.value })}
            addonAfter='单位'
          />
        </Form.Item>
        <Form.Item label='导入' validateStatus={verify.required}>
          <div className='display-flex'>
            <Input
              readOnly
              disabled={formBase.Value}
              value={formBase.File?.name}
              className='flex-1'
            />
            <Upload
              showUploadList={false}
              maxCount={1}
              beforeUpload={handleUpload}
              disabled={formBase.Value}
            >
              <Button type='primary' disabled={formBase.Value} style={{ marginLeft: 8 }}>选择</Button>
            </Upload>
            {
              formBase.File
                ? <Button type='primary' onClick={() => setFormBase({ ...formBase, File: '' })} className='mg-l4'>重置</Button>
                : null
            }
          </div>
        </Form.Item>
        <Form.Item label=' ' colon={false}>
          <Checkbox
            checked={formBase.IsSaveController}
            onChange={evt => setFormBase({ ...formBase, IsSaveController: evt.target.checked })}
          />
          <span className='pd-l8'>存入当前控制器</span>
        </Form.Item>
      </Form>
      <div className='ant-modal-footer'>
        <Button onClick={handleCancel}>取消</Button>
        <Button type='primary' onClick={handleOk}>确定</Button>
      </div>
    </React.Fragment>
  )
}

export default TargetOffset