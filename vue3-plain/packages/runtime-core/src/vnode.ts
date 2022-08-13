import { isArray, isFunction, isObject, isString, ShapeFlags } from "@vue/shared";
import { isTeleport } from "./components/Teleport";

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}

export function isSameVnode(n1, n2) { // 两个虚拟节点是否是相同的 1标签名相同 2key相同
  return (n1.type === n2.type) && (n1.key === n2.key)
}

export function createVnode(type, props, children = null, patchFlag = 0) {
  // 组合方案 shapeFlag
  let shapeFlag =
    isString(type) ? ShapeFlags.ELEMENT :
    isTeleport(type) ? ShapeFlags.TELEPORT:
    isFunction(type) ? ShapeFlags.FUNCTIONAL_COMPONENT:
    isObject(type) ? ShapeFlags.STATEFUL_COMPONENT:  0; // 0可能是文本、Fragment
  const vnode = {
    type,
    props,
    children,
    el: null, // 真实节点
    key: props?.['key'],
    __v_isVnode: true,
    shapeFlag,
    patchFlag,
  }
  if (children) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else if (isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type; // 等价于 vnode.shapeFlag = vnode.shapeFlag | type
  }
  if (currentBlock && vnode.patchFlag > 0) {
    currentBlock.push(vnode)
  }
  return vnode
  // 元素|children = 17 或 9; 17包含16(指17=16+1, 1能写成2的几次幂), 证明children是array
  // 不是text 8, 因为 17 = 8 + 9, 9不能写成2的几次幂
}
export { createVnode as createElementVNode }

let currentBlock = null
export function openBlock() { // 用数组收集动态节点
  currentBlock = []
}

export function createElementBlock(type, props, children, patchFlag) {
  return setupBlock(createVnode(type, props, children, patchFlag))
}
function setupBlock(vnode) {
  vnode.dynamicChildren = currentBlock
  currentBlock = null
  return vnode
}

export function toDisplayString(val) {
  return isString(val) ? val
          :
            val === null ? ''
              :
                isObject(val) ? JSON.stringify(val) : String(val)
}
