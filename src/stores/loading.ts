import { makeObservable, observable, action, computed } from 'mobx'

class LoadingStore {
  visible: boolean
  msg?: string

  visibleTimestamp: number
  delay: number
  timer: any
  counter: string[]

  constructor () {
    this.visible = false
    this.msg = undefined
    this.visibleTimestamp = 0
    this.delay = 200
    this.timer = -1
    this.counter = []

    makeObservable<LoadingStore, '_show' | '_hide'>(this, {
      visible: observable,
      msg: observable,
      counter: observable,
      isVisible: computed,
      show: action,
      hide: action,
      _show: action,
      _hide: action
    })
  }

  get isVisible () {
    let target: any = {}
    this.counter.forEach((count: string) => {
      target[count] = true
    })
    return target
  }

  show (msg: string = '请稍后...', type: string = 'manualOperation') {
    this.counter = [...this.counter, type]
    clearTimeout(this.timer)

    msg && (this.msg = msg)
    this.timer = setTimeout(() => { this._show() }, this.delay)
  }

  private _show () {
    this.visibleTimestamp = new Date().getTime()
    this.visible = true
  }

  /**
   * 隐藏 Loading 组件
   * @param {boolean} force 强制立即关闭
   * show 和 hide 是成对出现的，所以 force 时，不需要清空 counter
   */
  hide (force: boolean = false, type: string = 'manualOperation') {
    if (!force) {
      this.counter = this.counter.filter((count: string) => count !== type)
    }
    if (this.counter.length <= 0 || force) {
      clearTimeout(this.timer)
      const timestamp = new Date().getTime()
      if (this.visible && timestamp - this.visibleTimestamp <= 300) {
        // show 和 hide 之间的间隔不足 300ms 时， 加载动画至少存在 300ms
        setTimeout(() => { this._hide() }, 300)
      } else {
        this._hide()
      }
    }
  }

  private _hide () {
    this.visible = false
  }
}

const loadingStore = new LoadingStore()

export default loadingStore