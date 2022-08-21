import { setActivePinia } from "pinia"
import { computed, effectScope, getCurrentInstance, inject, reactive, toRefs, isRef, watch } from "vue"
import { addSubscription, triggerSubscription } from "./pubSub"
import { activePinia, SymbolPinia } from "./rootStore"

function isObject(val) {
  return typeof val === 'object' && val !== null
}

function mergeReactiveOnject(target, partialState) {
  for(let key in partialState) {
    if(!partialState.hasOwnProperty(key)) continue // 排除原型链
    const oldValue = target[key]
    const newValue = partialState[key]

    // 状态有可能是ref，ref也是一个对象，不能递归
    if (isObject(oldValue) && isObject(newValue) && !isRef(newValue)) {
      target[key] = mergeReactiveOnject(oldValue, newValue)
    } else {
      target[key] = newValue
    }
  }
  return target
}

export function defineStore(idOrOptions, setup) {
  let id
  let options
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else {
    options = idOrOptions
    id = idOrOptions.id
  }

  const isSetupStore = typeof setup === 'function'

  function useStore() {
    const currentInstance = getCurrentInstance()
    let pinia = currentInstance && inject(SymbolPinia)
    if (pinia) {
      setActivePinia(pinia)
    }
    pinia = activePinia
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, pinia)
      } else {
        createOptionsStore(id, options, pinia)
      }
    }
    const store = pinia._s.get(id)
    return store
  }
  return useStore
}

function createSetupStore(id, setup, pinia) {
  let scope

  // _e能停止所有的store
  // 每个store能停止自己的
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })

  function wrapAction(name, action) {
    return function () {

      const afterCallbackList = []
      const onErrorCallbackList = []
      function after(callback) {
        afterCallbackList.push(callback)
      }
      function onError(callback) {
        onErrorCallbackList.push(callback)
      }

      triggerSubscription(actionSubscriptions, { after, onError, store, name }) // 1 执行一部分代码; 2 存after onError回调

      let ret
      try {
        ret = action.apply(store, arguments)
      } catch (error) {
        triggerSubscription(onErrorCallbackList, error)
      }

      if (ret instanceof Promise) {
        return ret.then(val => {
          triggerSubscription(afterCallbackList, val)
        }).catch(error => {
          triggerSubscription(onErrorCallbackList, error)
          return Promise.reject(error)
        })
      } else {
        triggerSubscription(afterCallbackList, ret)
      }
      return ret
    }
  }

  for(const key in setupStore) {
    const prop = setupStore[key]
    if (typeof prop === 'function') {
      setupStore[key] = wrapAction(key, prop)
    }
  }

  function $patch(partialStateOrMutation) {
    if (typeof partialStateOrMutation === 'function') {
      partialStateOrMutation(store)
    } else {
      mergeReactiveOnject(store, partialStateOrMutation)
    }
  }

  let actionSubscriptions = []
  const partialStore = {
    $patch,
    $subscribe(callback, options) {
      scope.run(() => watch(pinia.state.value[id], state => {
        callback(state, { type: 'direct' })
      }, options))
    },
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $dispose() {
      scope.stop()
      actionSubscriptions = []
      pinia._s.delete(id) // 删除store
    }
  }

  const store = reactive(partialStore)

  // 场景： 数据存到localStorage, 页面刷新, 从localStorage取值替换store的数据
  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[id],
    set: (state) => $patch($state => Object.assign($state, state))
  })
  Object.assign(store, setupStore)

  // 每个store都会应用插件
  pinia._p.forEach(plugin => Object.assign(store, plugin({ store, pinia, app: pinia._a })))

  pinia._s.set(id, store)
  return store
}

function createOptionsStore(id, options, pinia) {
  const { state, getters, actions } = options

  function setup() {
    // ref放入对象，会被自动proxy, 此时已是响应式
    pinia.state.value[id] = state ? state() : {}
    const localState = toRefs(pinia.state.value[id]) // computed生效
    return Object.assign(
      localState,
      actions,
      Object.keys(getters || {}).reduce((computedGetters, name) => {
        computedGetters[name] = computed(() => {
          return getters[name].call(store, store)
        })
        return computedGetters
      }, {})
    )
  }

  const store = createSetupStore(id, setup, pinia)
  store.$reset = function() { // 重置所有状态, 不能在setupStore中使用, 只能在optionStore中使用
    const newState = state ? state() : {}
    store.$patch(($state) => {
      Object.assign($state, newState)
    })
  }

  return store
}
