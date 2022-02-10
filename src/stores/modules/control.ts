import { makeObservable, observable, runInAction } from 'mobx'

class ControlStore {
  /**
   * 将初始化的步骤移动到 constructor 中，
   * 并且请务必初始化，否则 babel 插件 plugin-transform-flow-strip-types 编译失败，
   * 相关联 issue: 
   * https://github.com/react-navigation/react-navigation/issues/5825#issuecomment-590723220
   * https://github.com/facebook/react-native/issues/20150#issuecomment-417858270
   */
  groupChangeDone: boolean

  constructor () {
    this.groupChangeDone = true

    makeObservable(this, {
      groupChangeDone: observable
    })
  }

  setGroupChangeStatus (isDone: boolean) {
    runInAction(() => {
      this.groupChangeDone = isDone
    })
  }
}

const controlStore = new ControlStore()

export default controlStore