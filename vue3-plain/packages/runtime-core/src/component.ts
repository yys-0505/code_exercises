import { proxyRefs, reactive } from "@vue/reactivity"
import { hasOwn, isFunction, isObject, ShapeFlags } from "@vue/shared"
import { initProps } from "./componentProps"

export let currentInstance = null
export const setCurrentInstance = instance => currentInstance = instance
export const getCurrentInstance = () => currentInstance

export const createComponentInstance = (vnode, parent) => {
  const instance = { // 组件实例
    ctx: {}, // 实例的上下文
    provides: parent ? parent.provides : Object.create(null),
    parent,
    data: null,
    vnode, // 组件的虚拟节点
    subTree: null, // 渲染的内容,即render的结果
    isMounted: false,
    update: null,
    propsOptions: vnode.type.props,
    props: {},
    attrs: {},
    proxy: null,
    render: null,
    setupState: {},
    slots: {},
  }
  return instance
}
const publicPropertyMap = {
  $attrs: i => i.attrs,
  $slots: i => i.slots,
}
const publicInstanceProxy = {
  get(target, key) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }

    // this.$attrs.name
    const getter = publicPropertyMap[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
      return true
    } else if (hasOwn(setupState, key)) {
      setupState[key] = value
    } else if (props && hasOwn(props, key)) {
      console.warn(`attemping to mutate prop ${key as string}`)
      return false
    }
    return true
  }
}

// 组件的插槽是一个对象, 放着映射关系, 渲染组件时去映射表中查找
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children // 保留children
  }
}
export const setupComponent = (instance) => {
  const { props, type, children } = instance.vnode
  initProps(instance, props)
  initSlots(instance, children)
  instance.proxy = new Proxy(instance, publicInstanceProxy)

  const data = type.data
  if (data) {
    if (!isFunction(data)) return console.warn('data option must be a function')
    instance.data = reactive(data.call(instance.proxy))
  }

  const setup = type.setup
  if (setup) {
    const setupContext = {
      emit(event, ...args) {
        const eventName = `on${event[0].toUpperCase()}${event.slice(1)}`
        const handler = instance.vnode.props[eventName]
        handler && handler(...args)
      },
      attrs: instance.attrs,
      slots: instance.slots,
    }
    setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null)
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else if (isObject(setupResult)) {
      instance.setupState = proxyRefs(setupResult) // 访问时取消.value
    }
  }
  if (!instance.render) {
    instance.render = type.render
  }
}

export function renderComponent(instance) {
  const { vnode, render, props } = instance
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    return render.call(instance.proxy, instance.proxy)
  } else {
    return vnode.type(props) // 函数式组件
  }
}