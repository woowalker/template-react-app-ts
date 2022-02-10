import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Scrollbars } from 'react-custom-scrollbars'
import { EnergyIcon } from 'src/components'
import { PaperMachineStatus, PaperMonitorControl, PaperMonitorChart } from './components'
import { commonStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import queryString from 'query-string'
import 'src/styles/modules/custom/paperMonitor.less'

const switchOptions = [{ label: '控制页面', value: 1 }, { label: '曲线页面', value: 2 }]
const PaperMonitor = () => {
  const location = useLocation()
  const OrgId = useMemo<any>(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    const target = queryString.parse(location.search)
    return target.OrgId || OrgId
  }, [location.search])

  const [machine, setMachine] = useState<any>({})
  const getMachine = () => {
    $api['home/getOneDetail']({ OrgId }).then((res: any) => {
      res && setMachine(res)
    })
  }
  useEffect(() => {
    getMachine()

    let timer = setInterval(() => {
      getMachine()
    }, 5000)

    return () => clearInterval(timer)
  }, [OrgId])

  const [switchType, setSwitchType] = useState(1)

  const { Name, IsOnline = true, Vars = [] } = machine
  return (
    <div className='paper-monitor'>
      <div className='paper-monitor__sider'>
        <div className='paper-monitor__machine'>
          {/** 纸机名称 */}
          <div className='paper-monitor__machine-item border-bottom'>
            <div className='display-flex flex-1 lineheight-1'>{Name}</div>
            <PaperMachineStatus status={IsOnline ? $consts['PAPERMONITOR/MACHINE_ONLINE'] : $consts['PAPERMONITOR/MACHINE_OFFLINE']} />
          </div>
          {/** 纸机变量 */}
          <Scrollbars
            autoHide
            autoHeight
            autoHeightMax='65vh'
            autoHideTimeout={1000}
            autoHideDuration={200}
          >
            {
              Vars.map((item: any, index: number) => {
                return (
                  <div
                    key={`${item.Name}_${index}`}
                    className={`paper-monitor__machine-item lineheight-1 ${index !== Vars.length - 1 ? 'border-bottom' : ''}`}
                  >
                    <div className='display-flex flex-1 flex-rowfsc'>
                      <EnergyIcon type={item.Icon} size={40} />
                      <span className='fz-18 pd-l24'>{item.Name}</span>
                    </div>
                    <span className='fz-24'>{item.Value}</span>
                  </div>
                )
              })
            }
          </Scrollbars>
        </div>
        {/** 控制与曲线切换 */}
        <div className='paper-monitor__switch'>
          {
            switchOptions.map((item: any) => {
              return (
                <div
                  key={`${item.label}_${item.value}`}
                  onClick={() => setSwitchType(item.value)}
                  className={`paper-monitor__switch-item ${item.value === switchType ? 'active' : ''}`}
                >{item.label}</div>
              )
            })
          }
        </div>
      </div>
      <div className='paper-monitor__main'>
        {
          switchType === 1
          ? <PaperMonitorControl orgId={OrgId} machine={machine} />
          : <PaperMonitorChart orgId={OrgId} />
        }
      </div>
    </div>
  )
}

export default PaperMonitor