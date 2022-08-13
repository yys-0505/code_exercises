import { reactive } from "@vue/reactivity"
import { hasOwn, ShapeFlags } from "@vue/shared"

export const initProps = (instance, rawProps) => {
  const props = {}
  const attrs = {}

  const options = instance.propsOptions || {}
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]
      if (hasOwn(options, key)) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props) // 源码用的shallowReative, 即只有一层数据是响应式
  instance.attrs = attrs

  if (instance.vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
    instance.props = instance.attrs // 函数式组件没有props, 都放到attrs上了
  }
}

export const hasPropsChange = (prevProps = {}, nextProps = {}) => {
  const nextKeys = Object.keys(nextProps)
  // 比对属性前后个数
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }
  // 比对属性值
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextKeys[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}

// export const updateProps = (instance, prevProps, nextProps) => {
//   if (hasPropsChange(prevProps, nextProps)) {
//     for (const key in nextProps) {
//       instance.props[key] = nextProps[key]
//     }
//     for (const key in instance.props) {
//       if (!hasOwn(nextProps, key)) {
//         delete instance.props[key]
//       }
//     }
//   }
// }
// 上面是优化前的方法, 使用到instance. 这里是优化后使用的方法
export const updateProps = (prevProps, nextProps) => {
  for (const key in nextProps) {
    prevProps[key] = nextProps[key]
  }
  for (const key in prevProps) {
    if (!hasOwn(nextProps, key)) {
      delete prevProps[key]
    }
  }
}