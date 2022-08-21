import { effectScope, markRaw, ref } from "vue";
import { setActivePinia, SymbolPinia } from './rootStore'

export function createPinia() {

  const scope = effectScope(true)

  // state就是ref({})
  const state = scope.run(() => ref({}))

  const _p = []
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia)
      pinia._a = app
      // 将pinia实例暴露在app上, 所有组件可通过inject注入进来
      app.provide(SymbolPinia, pinia)
      app.config.globalProperties.$pinia = pinia
    },
    use(plugin) {
      _p.push(plugin)
      return this
    },
    _p,
    _a: null,
    state, // 所有状态
    _e: scope, // 用来管理整个应用effectScope
    _s: new Map() // 记录所有store
  })
  return pinia
}