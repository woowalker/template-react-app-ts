import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Tabs, Empty } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { EnergyIcon } from 'src/components'
import { PaperMachineStatus } from './components'
import { commonStore } from 'src/stores'
import { $api, $consts } from 'src/plugins'
import { cloneDeep } from 'lodash'
import 'src/styles/modules/custom/home.less'

const { TabPane } = Tabs
const Home = () => {
  const [machines, setMachines] = useState([])
  useEffect(() => {
    const { ORG_ID: OrgId } = commonStore.userinfo
    $api['home/getMachines']({ OrgId }).then((res: any) => {
      res && setMachines(res)
    })
  }, [])

  const history = useHistory()
  const handleNav = (search: string) => {
    // 跳转去纸机监测页面
    const find = commonStore.flatMenus.find((item: any) => item.Nav_MenuForm?.CODE === $consts['FORM/CODE_RTM002'])
    find && history.push({
      pathname: `/main/${find.ID}`,
      search: `?OrgId=${search}`
    })
  }

  return (
    <div className='home'>
      {
        machines.map((item: any, index: number) => {
          const { Name, Img, IsOnline, OrgId, Tops = [], Groups = [], collapsed = false } = item
          const backgroundImage = Img || `url(${require('src/assets/custom/paper-machine.svg').default})`
          const copyTops = cloneDeep(Tops)
          copyTops.splice(1, 0, { isName: true })
          return (
            <div key={`${Name}_${index}`} className='home__paper'>
              <div className='home__paper-overview'>
                <div className='home__paper-pic'>
                  <div className='home__paper-pic--bg' style={{ backgroundImage }} />
                  <div
                    onClick={() => {
                      item.collapsed = !collapsed
                      setMachines([...machines])
                    }}
                    className='home__paper-pic--more'
                  >
                    <span>更多参数</span>
                    {collapsed ? <UpOutlined className='fz-16 pd-l8' /> : <DownOutlined className='fz-16 pd-l8' />}
                    <PaperMachineStatus
                      status={IsOnline ? $consts['PAPERMONITOR/MACHINE_ONLINE'] : $consts['PAPERMONITOR/MACHINE_OFFLINE']}
                      className='home__paper-pic--status'
                    />
                  </div>
                </div>
                <div className='home__paper-vars overview'>
                  {
                    copyTops.map((t: any, ti: number) => {
                      if (t.isName) {
                        return (
                          <div key={`${t.Name}_${ti}`} className='home__paper-vars--zone is-name'>
                            <Button
                              block
                              type='primary'
                              size='large'
                              onClick={() => handleNav(OrgId)}
                            >{Name}</Button>
                          </div>
                        )
                      }
                      return (
                        <div key={`${t.Name}_${ti}`} className='home__paper-vars--zone'>
                          <EnergyIcon type={t.Icon} size={52} style={{ margin: '0 10%' }} />
                          <div className='text-left'>
                            <div className='fz-16'>{t.Name}</div>
                            <div className='fz-24'>{t.Value}</div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <div className='home__paper-detail' style={{ display: item.collapsed ? 'block' : 'none' }}>
                <Tabs>
                  {
                    Groups.map((g: any, gi: number) => {
                      const { Vars = [] } = g
                      // fakes 用于布局补齐
                      const fakeCount = Math.ceil(Vars.length / 3) * 3 - Vars.length
                      const fakes = fakeCount > 0 ? new Array(fakeCount).fill(true) : []
                      return (
                        <TabPane key={`${g.Id}_${gi}`} tab={g.Name}>
                          <div className='home__paper-vars details'>
                            {
                              Vars.map((v: any, vi: number) => {
                                return (
                                  <div key={`${v.Name}_${vi}`} className='home__paper-vars--zone'>
                                    <EnergyIcon type={v.Icon} size={52} style={{ margin: '0 10%' }} />
                                    <div className='text-left'>
                                      <div className='fz-16'>{v.Name}</div>
                                      <div className='fz-24'>{v.Value}</div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                            {
                              fakes.map((f: any, fi: number) => {
                                return <div key={`fake-vars_${fi}`} className='home__paper-vars--zone opacity-0' />
                              })
                            }
                          </div>
                        </TabPane>
                      )
                    })
                  }
                  {
                    !Groups.length
                      ? (
                        <div className='text-center'>
                          <Empty description={<p className='text-attach'>暂无更多参数</p>} />
                        </div>
                      )
                      : null
                  }
                </Tabs>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default Home