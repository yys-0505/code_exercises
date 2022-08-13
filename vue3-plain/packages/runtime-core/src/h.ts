import { isArray, isObject } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

export function h(type, propsOrChildren?, children?) { // >3个的肯定是孩子
  const l = arguments.length
  // h('div', { style: { color: 'red }})
  // h('div', h('span'))
  // h('div', [h('span'), h('span')])
  // h('div', 'hello')
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) { // 虚拟节点包装成数组
        return createVnode(type, null, [propsOrChildren])
      }
      return createVnode(type, propsOrChildren) // 属性
    } else {
      return createVnode(type, null, propsOrChildren) // 文本
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) { // h('div', {}, h('span'))
      children = [children]
    }
    return createVnode(type, propsOrChildren, children) // children有两种：文本 数组
  }
}