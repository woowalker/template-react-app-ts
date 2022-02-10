import { useState, useEffect, useMemo } from 'react'
import { Form, Select, Row, Col, Table } from 'antd'
import { TimeChartShow } from '.'
import { $api } from 'src/plugins'

const lineTypes = [
  { label: '平均值', value: 'AvgValue' },
  { label: '2σ', value: 'TwoSigma' }
]

type Props = {
  orgId: string,
  // machine: any
}
const PaperMonitorChart = (props: Props) => {
  const [actuatorList, setActuatorList] = useState([])
  const [actuator, setActuator] = useState('')
  const [measureList, setMeasureList] = useState([])
  const [measures, setMeasures] = useState<string[]>([])

  useEffect(() => {
    $api['home/getActuatorsByMachine']({
      OrgId: props.orgId
    }).then((res: any) => {
      res && setActuatorList(res)
    })
  }, [])

  useEffect(() => {
    const { Id, CVList = [] } = actuatorList[0] || {}
    setActuator(Id)
    setMeasureList(CVList)
    setMeasures(CVList.map((item: any) => item.Id))
  }, [actuatorList])

  const handleActuatorChange = (val: string) => {
    const find: any = actuatorList.find((item: any) => item.Id === val)
    const { Id, CVList = [] } = find
    setActuator(Id)
    setMeasureList(CVList)
    setMeasures(CVList.map((item: any) => item.Id))
  }

  const [chartData, setChartData] = useState<any>([])
  useEffect(() => {
    if (!actuator) return

    $api['home/getMachineCurveData']({
      ActuatorId: actuator,
      MeasuringObjectIds: measures
    }).then((res: any) => {
      res && setChartData(res)
    })
  }, [actuator, measures])

  const [lineType, setLineType] = useState('AvgValue')

  const [slider, setSlider] = useState('')

  const series = useMemo(() => {
    return chartData.map((item: any) => {
      return {
        field: item.Id,
        chartOption: {
          lineOption: {
            name: item.Name
          }
        }
      }
    })
  }, [chartData])

  const targetData = useMemo(() => {
    const data = chartData[0]?.Data?.map((item: any) => ({ Time: item.Time })) || []
    data.forEach((item: any) => {
      series.forEach((se: any) => {
        const matchChart = chartData.find((chart: any) => chart.Id === se.field)
        const matchData = matchChart.Data.find((d: any) => d.Time === item.Time)
        item[se.field] = matchData[lineType]
      })
    })
    return {
      Data: data
    }
  }, [series, chartData, lineType])

  const tableData = useMemo(() => {
    const columns = [
      { title: '序号', dataIndex: 'No' },
      { title: '名称', dataIndex: 'Name' },
      { title: '状态', dataIndex: 'Value' },
      { title: '单位', dataIndex: 'Unit' },
    ]
    const dataSource: any = []
    measures.forEach((item: string, index: number) => {
      const matchChart = chartData.find((chart: any) => chart.Id === item)
      const matchData = matchChart?.Data?.find((d: any) => d.Time === slider)
      dataSource.push({
        No: index + 1,
        Name: matchChart?.Name,
        Value: matchData?.[lineType],
        Unit: matchChart?.Unit
      })
    })
    return { columns, dataSource }
  }, [slider, measures, chartData, lineType])
  console.log('tableData', tableData)

  return (
    <div className='paper-monitor__chart'>
      <Form
        layout='horizontal'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        className='mg-b18'
      >
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label='执行器'>
              <Select
                fieldNames={{ label: 'Name', value: 'Id' }}
                options={actuatorList}
                value={actuator}
                onChange={handleActuatorChange}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='测量对象'>
              <Select
                mode='multiple'
                fieldNames={{ label: 'Name', value: 'Id' }}
                options={measureList}
                value={measures}
                onChange={setMeasures}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='曲线类别'>
              <Select
                options={lineTypes}
                value={lineType}
                onChange={setLineType}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <TimeChartShow
        slider={slider}
        sliderPosition='bottom'
        chartData={targetData}
        chartHeight={260}
        seriesData={series}
        onChange={setSlider}
      />
      <Table
        pagination={false}
        columns={tableData.columns}
        dataSource={tableData.dataSource}
        className='mg-t18'
      />
    </div>
  )
}

export default PaperMonitorChart