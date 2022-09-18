
import RouterView from './components/view.js'

export let _Vue

export default function install(Vue) {
  _Vue = Vue

  Vue.mixin({
    // 在所有组件上都加了_routerRoot属性
    beforeCreate() {
      if (this.$options.router) { // 根实例
        this._routerRoot = this // this是根实例
        this._router = this.$options.router
        this._router.init(this)
        // 给根实例添加_route属性, 且响应式化, 指向current; _route变化会引起视图更新
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else { // 子组件
        // 子组件_routerRoot找到根实例。这样所有组件都能拿到根实例
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }
    }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route // 每个组件都有根实例: _routerRoot
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })

  Vue.component('RouterView', RouterView)
}