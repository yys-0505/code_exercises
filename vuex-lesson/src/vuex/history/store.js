import { reactive } from "vue"
import { forEachValue } from "./utils"
import { storeKey } from "./injectKey"

export default class Store {
  constructor(options) {
    const store = this
    // 取数据:store._state.data.xxx
    store._state = reactive({ data: options.state })
    // 为啥加一层data? api replaceState可以store._state.data = xxx, 不加data要写成store._state = reactive({...})

    const _getters = options.getters // double: function => getter
    store.getters = {}
    forEachValue(_getters, function(fn, key) {
      Object.defineProperty(store.getters, key, {
        enumerable: true,
        get: () => fn(store.state)
      })
    })

    store._mutations = Object.create(null)
    store._actions = Object.create(null)
    const _mutations = options.mutations
    const _actions = options.actions
    forEachValue(_mutations, (mutation, key) => {
      store._mutations[key] = (payload) => {
        mutation.call(store, store.state, payload)
      }
    })
    forEachValue(_actions, (action, key) => {
      store._actions[key] = (payload) => {
        action.call(store, store, payload)
      }
    })
  }
  commit = (type, payload) => { // ES7语法, 保证结构出来的commit, 内部this是当前对象
    this._mutations[type](payload)
  }
  dispatch = (type, payload) => {
    this._actions[type](payload)
  }

  get state() {
    return this._state.data
  }
  install(app, injectKey) { // createApp().use(store, 'my')
    // 全局暴露一个变量, 值是store实例
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }
}