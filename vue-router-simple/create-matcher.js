import createRouteMap from './create-route-map.js'
import { createRoute } from './history/base.js'

export default function createMatcher(routes) {
  // 扁平化用户传入的数据，创建路由映射表
  // pathList: [/, /about, /about/a, /about/b]
  // pathMap: { /:记录, /about:记录, /about/a:记录, /about/b:记录 }
  const { pathList, pathMap } = createRouteMap(routes) // 初始化配置

  // 动态添加
  function addRoutes(routes) { // 添加新配置
    createRouteMap(routes, pathList, pathMap)
  }

  // 用来匹配的方法, 目的是找到当前记录
  function match(location) {
    const record = pathMap[location]
    const local = {
      path: location
    }
    if (record) {
      // {path: '/about/a', component:xxx} 先渲染about组件，再渲染a组件
      // 需要找到对应的记录 并且要根据记录产生一个匹配数组
      return createRoute(record, local)
    }
    return createRoute(null, local)
  }
  return {
    match,
    addRoutes
  }
}