import { makeObservable, observable, runInAction } from 'mobx'
import { $consts } from 'src/plugins'
import { cloneDeep } from 'lodash'

export type Message = {
  Id: string,
  RelateId: string,
  Title: string,
  Message: string,
  Time: string,
  TypeCode: number,
  [propsName: string]: any
}

export type Notice = {
  TypeCode: string,
  Data: Message[],
  UnRead: number
}

export type Notices = Notice[]

class NoticeStore {
  /**
   * 将初始化的步骤移动到 constructor 中，
   * 并且请务必初始化，否则 babel 插件 plugin-transform-flow-strip-types 编译失败，
   * 相关联 issue: 
   * https://github.com/react-navigation/react-navigation/issues/5825#issuecomment-590723220
   * https://github.com/facebook/react-native/issues/20150#issuecomment-417858270
   */
  visible: boolean
  notices: Notices
  activeNotice?: Message

  constructor () {
    this.visible = false
    this.notices = []

    makeObservable(this, {
      visible: observable,
      notices: observable,
      activeNotice: observable
    })
  }

  setVisible (visible: boolean) {
    runInAction(() => {
      this.visible = visible
    })
  }

  setNotice (notice: Notice) {
    if (!notice) return
    // store notice 消息
    const findIndex = this.notices.findIndex((item: Notice) => item.TypeCode === notice.TypeCode)
    if (findIndex !== -1) {
      runInAction(() => {
        this.notices.splice(findIndex, 1, notice)
      })
    } else {
      runInAction(() => {
        this.notices.push(notice)
      })
    }
    // 半闭环消息的强提醒
    if (notice.TypeCode === $consts['SOCKET/LOOP_LIST'] && notice.Data && notice.Data[0]) {
      this.setActiveNotice(notice.Data[0])
    }
  }

  setActiveNotice (msg: Message) {
    runInAction(() => {
      this.activeNotice = cloneDeep(msg)
    })
  }
}

const noticeStore = new NoticeStore()

export default noticeStore