import { useState, useEffect, useContext } from 'react'
import { Form, Button, Select, Input, InputNumber, Row, Col, Tabs, Switch, message } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { ModalContext, PaginationSelect, CountTime } from 'src/components'
import { commonStore } from 'src/stores'
import { $api } from 'src/plugins'
import { initFilter, getSingleRule, extendRules } from 'src/utils/common'
import { pick } from 'lodash'

const { TabPane } = Tabs

type Props = {
  group: any,
  controlDetail: any,
  counter: number,
  onGroupSwitch: Function,
  onSuccess: Function
}

const changeTimeOptions = [
  { label: '秒', value: 'seconds' },
  { label: '分', value: 'minutes' },
  { label: '时', value: 'hours' }
]
const ControlConfigSet = (props: Props) => {
  // 组切换
  const [isCustom, setIsCustom] = useState(false)

  // 可切换组列表
  const [groupList, setGroupList] = useState([])
  useEffect(() => {
    $api['controlmonitor/getOtherControllerGroups']().then((res: any) => {
      if (res) {
        setGroupList(res)
        setTargetGroup(res[0].Id)
      }
    })
  }, [])

  // 手动组切换
  const [targetGroup, setTargetGroup] = useState('')
  const [targetTimes, setTargetTimes] = useState(60)
  const [timeType, setTimeType] = useState('seconds')

  const handleGroupSwitch = () => {
    if (!targetTimes) return
    // 如果自动组切换开启，则将其关闭
    let leftTime = targetTimes
    switch (timeType) {
      case 'minutes':
        leftTime = targetTimes * 60
        break
      case 'hours':
        leftTime = targetTimes * 60 * 60
        break
    }
    props.onGroupSwitch({
      leftTime,
      targetGroup,
      targetTimes,
      timeType
    })
    handleCancel()
  }

  // 表单数据
  const [formBase, setFormBase] = useState({
    AutoInitVarId: '', // 自动初始化源点 ID
    DCSVarId: '', // DCS 源点 ID
    DebugVarId: '' // 调试源点 ID
  })
  useEffect(() => {
    setFormBase(pick(props.controlDetail, ['AutoInitVarId', 'DebugVarId', 'DCSVarId']))
  }, [props.controlDetail])

  // form 表单验证状态
  const [verify, setVerify] = useState<any>({})
  const validateForm = () => {
    const { AutoInitVarId, DCSVarId, DebugVarId } = formBase
    !AutoInitVarId ? (verify.AutoInitVarId = 'error') : (verify.AutoInitVarId = undefined)
    !DCSVarId ? (verify.DCSVarId = 'error') : (verify.DCSVarId = undefined)
    !DebugVarId ? (verify.DebugVarId = 'error') : (verify.DebugVarId = undefined)
    setVerify({ ...verify })
    return !AutoInitVarId || !DebugVarId || !DCSVarId
  }

  // 获取变量数据源分页列表
  const getDataSource = (params: any, type: string) => {
    const { current: PageIndex, search, initSearch } = params
    const { ORG_ID: OrgId } = commonStore.userinfo
    const payload = initFilter({ OrgId, PageIndex })
    const singleRule = [getSingleRule('NAME', 9, search)]
    !search && initSearch && singleRule.push(getSingleRule('ID', 1, initSearch))
    extendRules(payload.FilterGroup, singleRule)

    return $api['app/orderPagedTwo'](payload)
  }
  // 数据源选择
  const handleSourceSelect = (val: string, type: string) => {
    if (type === 'autoSource') {
      setFormBase({ ...formBase, AutoInitVarId: val })
    }
    if (type === 'dcsSource') {
      setFormBase({ ...formBase, DCSVarId: val })
    }
    if (type === 'debugSource') {
      setFormBase({ ...formBase, DebugVarId: val })
    }
  }

  // 弹框
  const modal = useContext(ModalContext)
  const handleOk = () => {
    if (validateForm()) return

    $api['controlmonitor/updateContorlSet']({
      ControllerId: props.controlDetail.Id,
      ...formBase
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
    <Tabs>
      <TabPane key='group-switch' tab='组切换'>
        <CountTime extraFont='组切换倒计时：' seconds={props.counter || 0} className='display-block mg-b12' />
        <Form layout='horizontal'>
          <Form.Item label='当前组切换策略'>
            <span style={{ color: props.group?.IsAutoChangeGroup ? '#73d13d' : '#bfbfbf' }}>{props.group?.IsAutoChangeGroup ? '已开启自动组切换' : '未开启自动组切换'}</span>
          </Form.Item>
          <Form.Item label='手动组切换'>
            <Switch checked={isCustom} onChange={setIsCustom} />
            {
              props.group?.IsAutoChangeGroup && isCustom
                ? (
                  <span style={{ color: '#ff7875' }} className='vertical-middle pd-l16'>
                    <InfoCircleOutlined className='mg-r4' />
                    <span>手动组切换开启后，将关闭自动组切换</span>
                  </span>
                )
                : null
            }
          </Form.Item>
        </Form>
        {
          isCustom
            ? (
              <Form layout='vertical' className='mg-t8'>
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item label='当前组'>
                      <Input disabled value={props.group?.GroupName} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label='目标组'>
                      <Select
                        fieldNames={{ label: 'Name', value: 'Id' }}
                        options={groupList}
                        value={targetGroup}
                        onChange={setTargetGroup}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label='切换时间' validateStatus={!targetTimes ? 'error' : undefined}>
                      <Row gutter={8}>
                        <Col span={16}>
                          <InputNumber min={1} value={targetTimes} onChange={setTargetTimes} style={{ width: '100%' }} />
                        </Col>
                        <Col span={8}>
                          <Select options={changeTimeOptions} value={timeType} onChange={setTimeType} />
                        </Col>
                      </Row>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )
            : null
        }
        {
          isCustom
            ? (
              <div className='ant-modal-footer mg-t8'>
                <Button onClick={handleCancel}>取消</Button>
                <Button type='primary' onClick={handleGroupSwitch}>确定</Button>
              </div>
            )
            : null
        }
      </TabPane>
      <TabPane key='func-config' tab='功能配置'>
        <Form layout='vertical'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                required
                validateStatus={verify.AutoInitVarId}
                label='自动初始化点'
              >
                <PaginationSelect
                  value={formBase.AutoInitVarId}
                  remoteMethod={(params: any) => getDataSource(params, 'autoSource')}
                  onChange={(data: any) => handleSourceSelect(data, 'autoSource')}
                  selectProps={{
                    allowClear: true
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                validateStatus={verify.DCSVarId}
                label='DCS控制点'
              >
                <PaginationSelect
                  value={formBase.DCSVarId}
                  remoteMethod={(params: any) => getDataSource(params, 'dcsSource')}
                  onChange={(data: any) => handleSourceSelect(data, 'dcsSource')}
                  selectProps={{
                    allowClear: true
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                validateStatus={verify.DebugVarId}
                label='调试'
              >
                <PaginationSelect
                  value={formBase.DebugVarId}
                  remoteMethod={(params: any) => getDataSource(params, 'debugSource')}
                  onChange={(data: any) => handleSourceSelect(data, 'debugSource')}
                  selectProps={{
                    allowClear: true
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className='ant-modal-footer'>
          <Button onClick={handleCancel}>取消</Button>
          <Button type='primary' onClick={handleOk}>确定</Button>
        </div>
      </TabPane>
    </Tabs>
  )
}

export default ControlConfigSet