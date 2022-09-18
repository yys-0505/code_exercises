export default {
  functional: true,
  render(h, { parent, data }) {
    const route = parent.$route // 就是 current
    // { path: /about/a, matched: [{path:/about, component:About}, {path:/about/a, component:AboutA}]}
    const matched = route.matched
    data.routerView = true // 当前组件是一个routerView

    let depth = 0

    while(parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      parent = parent.$parent
    }

    const record = matched[depth]
    if (!record) {
      return h()
    }
    const component = record.component
    return h(component, data)
  }
}