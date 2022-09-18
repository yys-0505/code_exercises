import install from './install.js'
import HashHistory from './history/hash.js'

import createMatcher from './create-matcher.js'

export default class VueRouter {
  constructor(options) {
    // 将routes转化为好维护的结构
    // match 匹配路径 {'/': '记录', 'about':'记录'}
    // addRoutes 动态添加路由配置
    this.matcher = createMatcher(options.routes || [])

    // 根据模式创建不同路由对象
    this.mode = options.mode || 'hash'

    this.history = new HashHistory(this)
  }
  init(app) { // app 是Vue根实例
    const history = this.history

    const setupHashListener = () => {
      history.setupListener()
    }

    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener // 第一次更新路由信息后 立刻添加监听路由变化事件
    )

    history.listen((route) => {
      app._route = route // 根实例上_route才是响应式, 所以要更改它, 并不只是更改current
    })
  }

  // 用来匹配路径
  match(location) {
    return this.matcher.match(location)
  }
}

VueRouter.install = install