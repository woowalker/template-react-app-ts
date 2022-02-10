import React, { useState, useEffect, useMemo, useRef } from 'react'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { Scrollbars } from 'react-custom-scrollbars'
import { Badge } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, CaretUpOutlined } from '@ant-design/icons'
import { ControlLoopSet } from 'src/modules/custom/components'
import { commonStore, noticeStore } from 'src/stores'
import { Message } from 'src/stores/modules/notice'
import { $consts } from 'src/plugins'
import Socket from 'src/utils/socket'
import { getSocketURL } from 'src/utils/tools'
import 'src/styles/modules/components/notice.less'

const AlarmNotice = () => {
  // 通用请求参数
  const loginPayload = useRef({})
  const loopListPayload = useRef({})
  useEffect(() => {
    const dispose = autorun(() => {
      const { Tenant } = commonStore.headers
      const { ID: UserId, NAME: UserName, ORG_ID: OrgId } = commonStore.userinfo
      const payload = { UserId, UserName, OrgId, ClientType: 0 }
      loginPayload.current = JSON.stringify({
        TypeCode: $consts['SOCKET/LOGIN'],
        ClientAppCode: $consts['CONFIG/APP_CODE'],
        ServiceCode: $consts['CONFIG/SERVICE_CODE'],
        Tenant,
        Data: JSON.stringify(payload)
      })
      loopListPayload.current = JSON.stringify({
        TypeCode: $consts['SOCKET/LOOP_LIST'],
        ClientAppCode: $consts['CONFIG/APP_CODE'],
        ServiceCode: $consts['CONFIG/SERVICE_CODE'],
        Tenant,
        Data: JSON.stringify(payload)
      })
    })

    return dispose
  }, [])

  const getSendPayload = (TypeCode: string, MessageId: string) => {
    const { Tenant } = commonStore.headers
    const { ID: UserId, NAME: UserName, ORG_ID: OrgId } = commonStore.userinfo
    const payload = { MessageId, UserId, UserName, OrgId, ClientType: 0 }
    return JSON.stringify({
      TypeCode,
      ClientAppCode: $consts['CONFIG/APP_CODE'],
      ServiceCode: $consts['CONFIG/SERVICE_CODE'],
      Tenant,
      Data: JSON.stringify(payload)
    })
  }

  // socket 实例
  const socket = useRef<any>()
  useEffect(() => {
    socket.current = new Socket({
      url: getSocketURL(),
      onopen: handleSocketOpened,
      onmessage: handleSocketOnMsg
    })

    return () => {
      socket.current && socket.current.close()
    }
  }, [])

  const handleSocketOpened = () => {
    socket.current.send(loginPayload.current)
    socket.current.send(loopListPayload.current)
  }

  const handleSocketOnMsg = (data: any) => {
    if (!data) return
    const { TypeCode, Data, UnRead } = JSON.parse(data)
    if ($consts['SOCKET/VALID_MSGLIST_TYPECODE'].indexOf(TypeCode) !== -1) {
      noticeStore.setNotice({ TypeCode, Data, UnRead })
    }
  }

  const handleSocketSendMsg = (TypeCode: string, Id: string, clear: boolean = false) => {
    socket.current.send(getSendPayload(TypeCode, Id))
    clear && setMsgList(msgList.filter((item: any) => item.Id !== Id))
  }

  // 消息列表
  const [msgList, setMsgList] = useState<Message[]>([])
  useEffect(() => {
    const dispose = autorun(() => {
      const { notices } = noticeStore
      const list: Message[] = []
      notices.forEach(item => {
        list.push(...item.Data)
      })
      setMsgList(list)
    })

    return dispose
  }, [])

  // 当前阅读消息
  const [index, setIndex] = useState(0)

  // 定时收起提示条
  useEffect(() => {
    let timer: any = -1
    const dispose = autorun(() => {
      const { visible } = noticeStore
      if (visible) {
        timer = setTimeout(() => {
          noticeStore.setVisible(false)
        }, 5000)
      }
    })
    return () => {
      dispose()
      clearTimeout(timer)
    }
  }, [index])

  // 处理点击事件
  const handleMsgClick = () => {
    noticeStore.setActiveNotice(msgList[index])
  }

  // 当前消息
  const msg = useMemo(() => {
    if (!msgList[index]?.Id) return

    return {
      title: `${msgList[index].Time} ${msgList[index].Title}`,
      content: msgList[index].Message
    }
  }, [msgList, index])

  const { visible, notices } = noticeStore
  const totalCount = notices.reduce((prev, curr) => prev + (curr.UnRead || 0), 0)
  return (
    <React.Fragment>
      <div className={`notice ${visible ? 'visible' : ''}`}>
        <div onClick={() => { noticeStore.setVisible(!noticeStore.visible) }} className='notice__toogle'>
          <CaretUpOutlined />
          <div className='notice__toogle-badge'>
            <Badge count={totalCount} />
          </div>
        </div>
        <div className='notice__content'>
          <div className='notice__content-title'>
            {
              msg
                ? (
                  <div
                    title={msg.title}
                    onClick={handleMsgClick}
                    className='notice__content-msg text-ellipsis pd-b6'
                  >{msg.title}</div>
                )
                : <span>暂无信息</span>
            }
          </div>
          <div className='notice__content-scroll'>
            <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200}>
              {
                msg
                  ? <div onClick={handleMsgClick} className='notice__content-msg'>{msg.content}</div>
                  : null
              }
            </Scrollbars>
          </div>
          <div
            title='上一条'
            onClick={() => index > 0 && setIndex(i => i - 1)}
            className={`display-none notice__content-prev ${index === 0 ? 'disabled' : ''}`}
          >
            <ArrowLeftOutlined />
          </div>
          <div
            title='下一条'
            onClick={() => index < msgList.length - 1 && setIndex(i => i + 1)}
            className={`display-none notice__content-next ${!msgList.length || index === msgList.length - 1 ? 'disabled' : ''}`}
          >
            <ArrowRightOutlined />
          </div>
        </div>
      </div>
      <ControlLoopSet onSuccess={handleSocketSendMsg} />
    </React.Fragment>
  )
}

export default observer(AlarmNotice)
