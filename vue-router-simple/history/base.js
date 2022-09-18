export function createRoute(record, location) {
  let res = []
  if (record) { // record: { path: /about/a, component: xx, parent: yy }
    while(record) {
      res.unshift(record)
      record = record.parent
    }
  }
  return {
    ...location,
    matched: res
  }
  // {
  //   path: '/about/a',
  //   matched: [
  //     {path: /about, component: About},
  //     {path: /about/a, component: AboutA }
  //   ]
  // }
}

export default class History {
  constructor(router) {
    this.router = router // router: new VueRouter
    // 默认应该保存一个当前路径 后续会更改这个路径
    //{ path: '/',  matched: [] }
    this.current = createRoute(null, { // null: 初始化没有匹配记录
      path: '/'
    })
  }

  // 跳转的核心逻辑 location代表跳转的目的地 onComplete跳转成功的回调
  transitionTo(location, onComplete) {
    debugger
    const route = this.router.match(location) // 根据路径 找到记录
    // route 就是当前路径要匹配的那些路由, 如下:
    // {
    //   path: '/about/a',
    //   matched: [
    //     {path: /about, component: About},
    //     {path: /about/a, component: AboutA }
    //   ]
    // }
    if (this.current.path === location && route.matched.length === this.current.matched.length) {
      return // 相同路径 不跳转
    }
    this.updateRoute(route)
    console.log('route', route);
    onComplete && onComplete()
  }

  updateRoute(route){
    this.current = route
    this.cb && this.cb(route)
  }

  listen(cb) {
    this.cb = cb
  }
}