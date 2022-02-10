/**
 * 存储全局 WebSocket 实例以及对应监听的消息
 */
class StorageSocket {
  socket?: WebSocket
  onopen: any[]
  onmessage: any[]
  onerror: any[]
  onclose: any[]
  reconnectTimer: any

  constructor () {
    this.socket = undefined
    this.onopen = []
    this.onmessage = []
    this.onerror = []
    this.onclose = []
    this.reconnectTimer = -1
  }
}
const storageSocket = new StorageSocket()

/**
 * 全局 WebSocket 实例
 */
type GlobalSocketProps = {
  url: string,
  autoReconnect?: boolean,
  reconnectInterval?: number
}
class GlobalSocket {
  // 全局 socket
  socket?: WebSocket
  socketUrl: string
  // 自动重连
  autoReconnect: boolean
  reconnectInterval?: number
  reconnectCount: number

  /**
   * 全局 socket 构造函数
   * @param props 
   * @param props.url socket url
   * @param props.autoReconnect socket 是否自动重连
   * @param props.reconnectInterval socket 自动重连间隔
   */
  constructor (props: GlobalSocketProps) {
    const { url, autoReconnect = true, reconnectInterval } = props
    this.socketUrl = url
    // 重连配置
    this.autoReconnect = autoReconnect
    this.reconnectInterval = reconnectInterval
    this.reconnectCount = 1
    // 构建 socket 实例
    clearTimeout(storageSocket.reconnectTimer)
    this.constructorSocket()
  }

  constructorSocket () {
    this.socket = storageSocket.socket = new window.WebSocket(this.socketUrl)
    this.socket.onopen = () => { this.evalFuncs('onopen') }
    this.socket.onmessage = (evt) => { this.evalFuncs('onmessage', evt.data) }
    this.socket.onerror = (err) => {
      console.error('socket error', err, new Date().toLocaleString())
      this.evalFuncs('onerror', err)
    }
    this.socket.onclose = (evt) => {
      console.error('socket close', evt.code, evt.reason, new Date().toLocaleString())
      this.evalFuncs('onclose', evt.code, evt.reason)
      console.error('socket reconnect', this.autoReconnect)
      this.autoReconnect && this.reconnect()
    }
  }

  /**
   * 执行 socket 监听的所有事件
   * @param type 'onopen' | 'onmessage' | 'onerror' | 'onclose'
   * @param restProps 参数
   */
  evalFuncs (type: 'onopen' | 'onmessage' | 'onerror' | 'onclose', ...restProps: any) {
    const funcs = storageSocket[type].filter(item => !!item)
    Array.isArray(funcs) && funcs.forEach(func => func instanceof Function && func(...restProps))
  }

  /**
   * 生成重连时间，重连次数越多，重连时间越长
   * 比如第一次重连 1000ms，第二次就是 3000ms，第三次就是 7000ms
   * @param count 重连次数
   * @returns 重连间隔时间
   */
  generateInterval (count: number) {
    return this.reconnectInterval || Math.min(30, Math.pow(2, count) - 1) * 1000
  }

  reconnect () {
    storageSocket.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.constructorSocket()
    }, this.generateInterval(this.reconnectCount))
  }
}

type SocketProps = {
  url: string,
  onopen?: Function,
  onmessage?: Function,
  onerror?: Function,
  onclose?: Function,
  newSocket?: boolean,
  autoReconnect?: boolean,
  reconnectInterval?: number
}
class Socket {
  // WebSocket 实例
  socket?: WebSocket
  socketEvtIndex: number

  constructor (props: SocketProps) {
    const { onopen, onmessage, onerror, onclose, newSocket = false, ...restProps } = props
    /**
     * 全局 g_socket 始终保持只有一个，
     * 只有在指定了 newSocket 时候，才会将 g_socket 对应新的 url 进行更新，
     * 否则 g_socket 永远保持第一次 new Socket 时创建的 WebSocket 实例
     */
    let globalSocket = undefined
    if (!storageSocket.socket || newSocket) {
      globalSocket = new GlobalSocket({ ...restProps })
    }
    this.socket = globalSocket?.socket || storageSocket.socket
    // 存储所有的监听函数，保证所有的监听信息都能执行
    storageSocket.onopen.push(onopen)
    storageSocket.onmessage.push(onmessage)
    storageSocket.onerror.push(onerror)
    storageSocket.onclose.push(onclose)
    // 保证新的 Socket 实例在调用 close 函数时，能正确移除监听的消息
    this.socketEvtIndex = storageSocket.onopen.length - 1
    // 如果已经存在 socket，则判断 opened 状态，opened 则直接调用 onopen 方法
    if (this.socket?.readyState === 1 && onopen instanceof Function) {
      /**
       * 由于已经存在 socket，所以在 new Socket 时会直接调用 onopen，
       * 往往这个时候 new Socket 的实例还未正确赋值到新组件中，
       * 这就会导致新组件 onopen 方法中使用 Socket 实例时报 Socket 实例为 undefined，
       * 所以这边将 onopen 方法放在微服务中，以确保新组件能正确接收到 Socket 实例的赋值
       */
      Promise.resolve().then(() => {
        onopen()
      })
    }
  }

  send (data: any) {
    if (!this.socket) return
    this.socket.send(data)
  }

  close () {
    if (this.socketEvtIndex === -1) return
    storageSocket.onopen.splice(this.socketEvtIndex, 1, undefined)
    storageSocket.onmessage.splice(this.socketEvtIndex, 1, undefined)
    storageSocket.onerror.splice(this.socketEvtIndex, 1, undefined)
    storageSocket.onclose.splice(this.socketEvtIndex, 1, undefined)
  }
}

export default Socket