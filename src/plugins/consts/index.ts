import CONST_DEFAULT_CONFIG from './config'
import CONST_CONFIG from './services'

type Options = {
  sep: string,
  config: any
}

type Consts = {
  [propsName: string]: any
}

class MakeConst {
  const: Consts

  constructor (options: Options) {
    this.const = {}
    this.constBuilder(options)
  }

  constBuilder ({
    sep = '/',
    config = []
  }: Options) {
    Object.keys(config).forEach((namespace: string) => {
      this._constSingleBuilder(namespace, {
        sep,
        config: config[namespace]
      })
    })
  }

  _constSingleBuilder (namespace: string, {
    sep,
    config
  }: Options) {
    config.forEach((cst: any) => {
      const { name, value } = cst
      const constName = `${namespace.toUpperCase()}${sep}${name}`
      Object.defineProperty(this.const, constName, { value })
    })
  }
}

export default new MakeConst({
  config: CONST_CONFIG,
  ...CONST_DEFAULT_CONFIG
})['const']