import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Switch } from 'antd'
import { UpOutlined } from '@ant-design/icons'
import { EnergyIcon } from 'src/components'
import { PaperMachineStatus } from '.'
import { commonStore } from 'src/stores'
import { $consts } from 'src/plugins'

type Props = {
  orgId: string,
  machine: any
}
const PaperMonitorControl = (props: Props) => {
  const [visible, setVisible] = useState(true)

  const history = useHistory()
  const handleNav = () => {
    // 跳转去控制器监测页面
    const find = commonStore.flatMenus.find((item: any) => item.Nav_MenuForm?.CODE === $consts['FORM/CODE_RTM003'])
    find && history.push({
      pathname: `/main/${find.ID}`,
      search: `?OrgId=${props.orgId}`
    })
  }

  const { CVList = [], MVList = [] } = props.machine
  // fakes 用于布局补齐
  const fakeCount = Math.ceil(MVList.length / 4) * 4 - MVList.length
  const fakes = fakeCount > 0 ? new Array(fakeCount).fill(true) : []
  return (
    <div className='paper-monitor__control'>
      {/** CVList */}
      <div className='paper-monitor__control-header'>
        {/** MD控制 */}
        <div className='paper-monitor__control-zone disabled'>
          <div className='display-flex flex-rowfsc'>
            <div className='display-flex flex-1 flex-rowfsc'>
              <PaperMachineStatus status={$consts['PAPERMONITOR/MACHINE_DISABLED']} />
              <Button
                disabled
                size='small'
                type='primary'
                className='mg-l18 pd-l24 pd-r24'
                style={{ borderRadius: 12 }}
              >MD控制</Button>
            </div>
            <UpOutlined
              onClick={() => setVisible(!visible)}
              className={`fz-16 cursor-pointer ${visible ? 'expand' : 'collapse'}`}
            />
          </div>
          <div className='mg-t8' style={{ display: visible ? 'block' : 'none' }}>
            {/** 单位 */}
            <div className='display-flex flex-rowfsc'>
              <div className='display-flex flex-3'></div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>PV</div>
                <div className='flex-1 fz-14 text-center'>SP</div>
              </div>
            </div>
            {/** 具体项 */}
            <div className='display-flex flex-rowfsc pd-t10 pd-b10 border-bottom'>
              <div className='display-flex flex-3 flex-rowfsc'>
                <EnergyIcon type='icon-zhongliang' size={28} />
                <span className='fz-14 pd-l18'>克重 gsm</span>
              </div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>163</div>
                <div className='flex-1 fz-14 text-center'>52</div>
              </div>
            </div>
            <div className='display-flex flex-rowfsc pd-t10'>
              <div className='display-flex flex-3 flex-rowfsc'>
                <EnergyIcon type='icon-shiyangshuifen' size={28} />
                <span className='fz-14 pd-l18'>水分 %</span>
              </div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>95</div>
                <div className='flex-1 fz-14 text-center'>226</div>
              </div>
            </div>
          </div>
        </div>
        {/** CD控制 */}
        <div className='paper-monitor__control-zone'>
          <div className='display-flex flex-rowfsc'>
            <div className='display-flex flex-1 flex-rowfsc'>
              <PaperMachineStatus status={$consts['PAPERMONITOR/MACHINE_ONLINE']} />
              <Button
                size='small'
                type='primary'
                onClick={handleNav}
                className='mg-l18 pd-l24 pd-r24'
                style={{ borderRadius: 12 }}
              >CD控制</Button>
            </div>
            <UpOutlined
              onClick={() => setVisible(!visible)}
              className={`fz-16 cursor-pointer ${visible ? 'expand' : 'collapse'}`}
            />
          </div>
          <div className='mg-t8' style={{ display: visible ? 'block' : 'none' }}>
            {/** 单位 */}
            <div className='display-flex flex-rowfsc'>
              <div className='display-flex flex-3'></div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'></div>
                <div className='flex-1 fz-14 text-center'>2σ</div>
              </div>
            </div>
            {/** 具体项 */}
            {
              CVList.map((item: any, index: number) => {
                const className = `display-flex flex-rowfsc pd-t10 ${index === 0 || index !== CVList.length - 1 ? 'pd-b10 border-bottom' : ''}`
                return (
                  <div key={`${item.Name}_${index}`} className={className}>
                    <div className='display-flex flex-3 flex-rowfsc'>
                      <EnergyIcon type={item.Icon} size={28} />
                      <span className='fz-14 pd-l18'>{item.Name}</span>
                    </div>
                    <div className='display-flex flex-2'>
                      <div className='flex-1 fz-14 text-center'></div>
                      <div className='flex-1 fz-14 text-center'>{item.TowSigma}</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        {/** 一键启停 */}
        <div className='paper-monitor__control-zone disabled'>
          <div className='display-flex flex-rowfsc'>
            <div className='display-flex flex-1 flex-rowfsc'>
              <PaperMachineStatus status={$consts['PAPERMONITOR/MACHINE_DISABLED']} />
              <Button
                disabled
                size='small'
                type='primary'
                className='mg-l18 pd-l24 pd-r24'
                style={{ borderRadius: 12 }}
              >一键启停</Button>
            </div>
            <UpOutlined
              onClick={() => setVisible(!visible)}
              className={`fz-16 cursor-pointer ${visible ? 'expand' : 'collapse'}`}
            />
          </div>
          <div className='mg-t8' style={{ display: visible ? 'block' : 'none' }}>
            {/** 单位 */}
            <div className='display-flex flex-rowfsc'>
              <div className='display-flex flex-3'></div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'></div>
                <div className='flex-1 fz-14 text-center opacity-0'>opacity</div>
              </div>
            </div>
            {/** 具体项 */}
            <div className='display-flex flex-rowfsc pd-t10 pd-b10 border-bottom'>
              <div className='display-flex flex-3 flex-rowfsc'>
                <EnergyIcon type='icon-yijianqiting' size={28} />
                <span className='fz-14 pd-l18'>一键启停</span>
              </div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'></div>
                <div className='flex-1 fz-14 text-center'>
                  <Switch disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/** 智能改抄 */}
        <div className='paper-monitor__control-zone disabled'>
          <div className='display-flex flex-rowfsc'>
            <div className='display-flex flex-1 flex-rowfsc'>
              <PaperMachineStatus status={$consts['PAPERMONITOR/MACHINE_DISABLED']} />
              <Button
                disabled
                size='small'
                type='primary'
                className='mg-l18 pd-l24 pd-r24'
                style={{ borderRadius: 12 }}
              >智能改抄</Button>
            </div>
            <UpOutlined
              onClick={() => setVisible(!visible)}
              className={`fz-16 cursor-pointer ${visible ? 'expand' : 'collapse'}`}
            />
          </div>
          <div className='mg-t8' style={{ display: visible ? 'block' : 'none' }}>
            {/** 单位 */}
            <div className='display-flex flex-rowfsc'>
              <div className='display-flex flex-3'></div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>SP</div>
                <div className='flex-1 fz-14 text-center'>目标</div>
              </div>
            </div>
            {/** 具体项 */}
            <div className='display-flex flex-rowfsc pd-t10 pd-b10 border-bottom'>
              <div className='display-flex flex-3 flex-rowfsc'>
                <EnergyIcon type='icon-zhongliang' size={28} />
                <span className='fz-14 pd-l18'>克重 gsm</span>
              </div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>163</div>
                <div className='flex-1 fz-14 text-center'>52</div>
              </div>
            </div>
            <div className='display-flex flex-rowfsc pd-t10'>
              <div className='display-flex flex-3 flex-rowfsc'>
                <EnergyIcon type='icon-shiyangshuifen' size={28} />
                <span className='fz-14 pd-l18'>水分 %</span>
              </div>
              <div className='display-flex flex-2'>
                <div className='flex-1 fz-14 text-center'>95</div>
                <div className='flex-1 fz-14 text-center'>226</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='paper-monitor__control-img' style={{ backgroundImage: `url(${require('src/assets/custom/paper-company.svg').default})` }} />
      {/** MVList */}
      <div className='paper-monitor__control-mv'>
        {
          MVList.map((item: any, index: number) => {
            const { Name, Icon, Values = [] } = item
            return (
              <div key={`${Name}_${index}`} className='paper-monitor__control-mvZone'>
                <div className='display-flex flex-rowfsc mg-b8'>
                  <EnergyIcon type={Icon} size={28} />
                  <span className='fz-16 pd-l12'>{Name}</span>
                </div>
                {
                  Values.map((v: any, vi: number) => {
                    const className = `pd-t10 overflow-hidden ${vi === 0 || vi !== Values.length - 1 ? 'pd-b10 border-bottom' : ''}`
                    return (
                      <div key={`${v.Name}_${vi}`} className={className}>
                        <span className='float-left fz-14'>{v.Name}</span>
                        <span className='float-right fz-14'>{v.Value}</span>
                      </div>
                    )
                  })
                }
              </div>
            )
          })
        }
        {
          fakes.map((f: any, fi: number) => {
            return <div key={`fake-mv_${fi}`} className='paper-monitor__control-mvZone opacity-0' />
          })
        }
      </div>
    </div>
  )
}

export default PaperMonitorControl