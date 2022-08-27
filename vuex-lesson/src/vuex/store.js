import { reactive, watch } from "vue"
import { storeKey } from "./injectKey"
import ModuleCollection from "./module/module-collection"
import { forEachValue, isPromise } from "./utils"

function getNestedState(state, path) {
  return path.reduce((state, key) => state[key], state)
}

function installModules(store, rootState, path, module) {
  const isRoot = !path.length

  const namespace = store._modules.getNamespaced(path)

  if (!isRoot) {
    // [aCount, bCount, cCount, dCount] : rootState.aCount.bCount.cCount = dCount.state
    const parentState = path.slice(0, -1).reduce((state, key) => state[key], rootState)
    store._withCommit(() => {
      parentState[path[path.length - 1]] = module.state
    })
  }

  // getters
  module.forEachGetter((getter, key) => { // double(state) { return state.count * 2 }
    store._wrappedGetters[namespace + key] = () => {
      return getter(getNestedState(store.state, path)) // rootState['aCount']['bCount'], 既是响应式又是最新值
    }
  })
  // mutations
  // mutations: { add: [mutation, mutation, ...] }
  module.forEachMutation((mutation, key) => { // add(state, payload) { state.count += payload }
    const entry = store._mutations[namespace + key] || (store._mutations[namespace + key] = [])
    entry.push(payload => { // store.commit('add', payload)
      mutation.call(store, getNestedState(store.state, path), payload)
    })
  })

  // actions
  module.forEachAction((action, key) => {
    const entry = store._actions[namespace + key] || (store._actions[namespace + key] = [])
    entry.push(payload => { // store.dispatch('login', payload).then(() => {})
      const res = action.call(store, store, payload)
      if (!isPromise(res)) {
        return Promise.resolve(res)
      }
      return res
    })
  })

  module.forEachChild((child, key) => {
    installModules(store, rootState, path.concat(key), child)
  })
}

function resetStoreState(store, state) {
  store._state = reactive({ data: state })
  const wrappedGetters = store._wrappedGetters
  store.getters = {}
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get: getter
    })
  })

  if (store.strict) {
    enableStrictMode(store)
  }
}

function enableStrictMode(store) {
  watch(() => store._state.data, () => {
    console.assert(store._commiting, 'do not mutate vuex store state outside mutation handlers') // store._commiting 为false才执行
  }, { deep: true, flush: 'sync' }) // 默认watch是异步的, 这里改成同步的
}

export default class Store {
  _withCommit(fn) {
    const commiting = this._commiting
    this._commiting = true
    fn()
    this._commiting = commiting
  }
  constructor(options) {
    const store = this
    store._modules = new ModuleCollection(options)

    // add: [fn, fn, ...] 发布订阅
    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)

    this.strict = options.strict || false
    this._commiting = false
    
    const state = store._modules.root.state // 根状态
    installModules(store, state, [], store._modules.root)
    
    resetStoreState(store, state)

    store._subscribes = []

    options.plugins.forEach(plugin => plugin(store))
  }

  subscribe(fn) {
    this._subscribes.push(fn)
  }

  get state() {
    return this._state.data
  }

  replaceState(newState) {
    this._withCommit(() => {
      this._state.data = newState
    })
  }

  commit = (type, payload) => {
    const entry = this._mutations[type] || []
    this._withCommit(() => {
      entry.forEach(handler => handler(payload))
    })
    this._subscribes.forEach(sub => sub({ type, payload }, this.state))
  }

  dispatch = (type, payload) => {
    const entry = this._actions[type] || []
    return Promise.all(entry.map(handler => handler(payload)))
  }
  
  install(app, injectKey) { // createApp().use(store, 'my')
    // 全局暴露一个变量, 值是store实例
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }

  registerModule(path, rawModule) {
    const store = this
    if (typeof path === 'string') path = [path]
    const newModule = store._modules.register(rawModule, path)
    installModules(store, store.state, path, newModule)
    resetStoreState(store, store.state)
  }
}
