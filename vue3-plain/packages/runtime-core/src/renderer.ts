import { reactive, ReactiveEffect } from "@vue/reactivity"
import { hasOwn, invokeArrayFns, isNumber, isString, PatchFlags, ShapeFlags } from "@vue/shared"
import { createComponentInstance, renderComponent, setupComponent } from "./component"
import { hasPropsChange, initProps, updateProps } from "./componentProps"
import { isKeepAlive } from "./components/KeepAlive"
import { queueJob } from "./scheduler"
import { getSequence } from "./sequence"
import { createVnode, Fragment, isSameVnode, Text } from "./vnode"

export function createRenderer(renderOptions) {

  let {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions

  const normalize = (children, i) => {
    if (isString(children[i]) || isNumber(children[i])) {
      const vnode = createVnode(Text, null, children[i])
      children[i] = vnode
    }
    return children[i]
  }

  const mountChildren = (children, container, parentComponent) => {
    for (let i = 0; i < children.length; i++) {
      const child = normalize(children, i)
      patch(null, child, container, parentComponent)
    }
  }

  const mountElement = (vnode, container, anchor, parentComponent) => {
    const { type, props, children, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)
    for (let key in props) {
      hostPatchProp(el, key, null, props[key])
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 数组
      mountChildren(children, el, parentComponent)
    }
    hostInsert(el, container, anchor)
  }


  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      const el = n2.el = n1.el // 文本内容变化 复用老的节点
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]) // 新的覆盖掉旧的
    }
    for (const key in oldProps) {
      if (newProps[key] === null) { // 新值里面没有, 则删除
        hostPatchProp(el, key, oldProps[key], undefined)
      }
    }
  }

  const unmountChildren = (children, parentComponent) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i], parentComponent)
    }
  }

  const patchKeyedChildren = (c1, c2, el, parentComponent) => {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    
    // sync from start
    // 尽可能减少比较的内容

    // c1=[a, b] c2=[a, b, c] 循环结束: i=2 e1=1 e2=2
    while (i<=e1 && i<=e2) { // 任何一方停止循环则直接跳出
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }

    // sync from end

    // c1=[b, c] c2=[a, b, c] 循环结束: i=0 e1=-1 e2=0
    while (i<=e1 && i<=e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }

    // common sequence & mount
    // i > e1: 说明有新增, i 和 e2之间是新增的部分
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], el, anchor) // 新建节点
          i++
        }
      }
    }
    // common sequence & unmount
    // i > e2: 说明有卸载, i 和 e1之间是新增的部分
    else if (i > e2) {
      if (i<=e1) {
        while (i<=e1) {
          unmount(c1[i], parentComponent)
          i++
        }
      }
    }
    // 优化完毕
    // 开始乱序比对
    let s1 = i
    let s2 = i
    const keyToNewIndexMap = new Map() // key: newIndex
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }

    // 循环老元素: 有, 对比; 没有, 添加; 老的有, 新的没有, 删除
    const toBePatched = e2 - s2 + 1 // 新元素总个数
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0) // 记录是否对比过的映射表
    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      let newIndex = keyToNewIndexMap.get(oldChild.key)
      if (newIndex === undefined) {
        unmount(oldChild, parentComponent)
      } else {
        // 新的位置对应的老位置; 数组值>0, 说明已经patch过了
        // 例: ab cde fg =>  ab ecdh fg, 此时 s1=2 s2=2
        // 循环 cde c,newIndex=3 d,newIndex=4 e,newIndex=2, -s2后才能对应新数组的下标
        // arr[1]=3 arr[2]=4 arr[0]=5
        newIndexToOldIndexMap[newIndex - s2] = i + 1 // 标记对应旧值的index; +1是特殊处理
        patch(oldChild, c2[newIndex], el)
      }
    }
    // console.log(newIndexToOldIndexMap); // 5 3 4 0
    
    // 最长递增子序列 [5, 3, 4, 0] [1, 2]

    // 获取最长递增子序列
    const increment = getSequence(newIndexToOldIndexMap) // [1, 2]

    // 移动位置
    let j = increment.length - 1
    for (let i = toBePatched - 1; i >= 0; i--) { // 3 2 1 0
      const index = i + s2
      const current = c2[index]
      const anchor = index + 1 < c2.length ? c2[index + 1].el : null
      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, current, el, anchor)
      } else { // 不是0 说明已经对比过属性和儿子了
        if (j !== increment[i]) { // 1 2
          hostInsert(current.el, el, anchor) // 复用节点
        } else {
          j--
        }
      }
    }
  }

  const patchChildren = (n1, n2, el, parentComponent) => { // 比较虚拟节点儿子的差异, el是父元素
    const c1 = n1.children
    const c2 = n2.children // 儿子种类: 文本 null 数组
    
    //      比较两个儿子列表差异
    //   新儿子 旧儿子 操作方式
    // 1 文本   数组   删除老儿子, 设置文本内容
    // 2 文本   文本   更新文本
    // 3 文本   空     更新文本(与上类似)
    // 4 数组   数组   diff算法
    // 5 数组   文本   清空文本, 进行挂载
    // 6 数组   空     进行挂载(与上类似)
    // 7 空     数组   删除所有儿子
    // 8 空     文本   清空文本
    // 9 空     空     无需处理

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1, parentComponent)
      }
      if (c1 !== c2) {  // 1 2 3
        hostSetElementText(el, c2)
      }
    } else { // 现在为数组或空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 4
          patchKeyedChildren(c1, c2, el, parentComponent)
        } else { // 7
          unmountChildren(c1, parentComponent)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '') // 8
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el, parentComponent) // 5 6
        }
      }
    }
  }

  const patchBlockChildren = (n1, n2, parentComponent) => {
    // 树的递归比较 => 数组的比较
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i], parentComponent)
    }
  }
  const patchElement = (n1, n2, parentComponent) => { // 先复用节点, 再比较属性, 再比较儿子
    let el = n2.el = n1.el
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    
    let { patchFlag } = n2
    if (patchFlag & PatchFlags.CLASS) {
      if (oldProps.class !== newProps.class) {
        hostPatchProp(el, 'class', null, newProps.class)
      }
      // style event
    } else {
      patchProps(oldProps, newProps, el)
    }

    if (n2.dynamicChildren) { // 靶向更新
      patchBlockChildren(n1, n2, parentComponent)
    } else {
      patchChildren(n1, n2, el, parentComponent) // 全量的diff算法
    }
  }

  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 === null) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      patchElement(n1, n2, parentComponent)
    }
  }

  const processFragment = (n1, n2, container, parentComponent) => {
    if (n1 === null) {
      mountChildren(n2.children, container, parentComponent)
    } else {
      patchChildren(n1, n2, container, parentComponent)
    }
  }

  const publicPropertyMap = {
    $attrs: i => i.attrs
  }

  // 组件3大特性: 属性 插槽 事件
  // props: 用户接收的
  // attrs: 用户没接收的, 非响应式, 取值this.$attrs.a
  const mountComponent = (vnode, container, anchor, parentComponent) => {
    // let { data = () => ({}), render, props:propsOptions = {} } = vnode.type // 用户写的内容
    // const state = reactive(data())
    // const instance = { // 组件实例
    //   state,
    //   vnode, // 组件的虚拟节点
    //   subTree: null, // 渲染的内容,即render的结果
    //   isMounted: false,
    //   update: null,
    //   propsOptions,
    //   props: {},
    //   attrs: {},
    //   proxy: null,
    // }
    // initProps(instance, vnode.props)

    // instance.proxy = new Proxy(instance, {
    //   get(target, key) {
    //     const { state, props } = target
    //     if (state && hasOwn(state, key)) {
    //       return state[key]
    //     } else if (props && hasOwn(props, key)) {
    //       return props[key]
    //     }

    //     // this.$attrs.name
    //     const getter = publicPropertyMap[key]
    //     if (getter) {
    //       return getter(target)
    //     }
    //   },
    //   set(target, key, value) {
    //     const { state, props } = target
    //     if (state && hasOwn(state, key)) {
    //       state[key] = value
    //       return true
    //     } else if (props && hasOwn(props, key)) {
    //       console.warn(`attemping to mutate prop ${key as string}`)
    //       return false
    //     }
    //     return true
    //   }
    // })

    // const componentUpdateFn = () => { // 初始化 or 更新
    //   if (!instance.isMounted) { // 初始化
    //     const subTree = render.call(instance.proxy)
    //     patch(null, subTree, container, anchor)
    //     instance.subTree = subTree
    //     instance.isMounted = true
    //   } else { // 组件内部更新, 非props
    //     const subTree = render.call(instance.proxy)
    //     patch(instance.subTree, subTree, container, anchor)
    //     instance.subTree = subTree
    //   }
    // }
    // const effect = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update))
    // const update = instance.update = effect.run.bind(effect)
    // update()



    // 将以上代码抽离
    // 1 创建组件实例
    const instance = vnode.component = createComponentInstance(vnode, parentComponent)
    if (isKeepAlive(instance.vnode)) {
      (instance.ctx as any).renderer = {
        createElement: hostCreateElement,
        move(vnode, container) {
          hostInsert(vnode.component.subTree.el, container) // move的vnode肯定是组件
        }
      }
    }


    // 2 给实例赋值
    setupComponent(instance)
    // 3 创建effect
    setupRenderEffect(instance, container, anchor)
  }

  const updateComponentPreRender = (instance, next) => {
    instance.next = null
    instance.vnode = next
    updateProps(instance.props, next.props)
    Object.assign(instance.slots, next.children) // 更新插槽
  }

  const setupRenderEffect = (instance, container, anchor) => {
    const { render } = instance
    const componentUpdateFn = () => { // 初始化 or 更新
      if (!instance.isMounted) { // 初始化
        const { bm, m, } = instance
        if (bm) {
          invokeArrayFns(bm)
        }
        // const subTree = render.call(instance.proxy, instance.proxy)
        const subTree = renderComponent(instance)
        patch(null, subTree, container, anchor, instance) // 这里的instance是后续组件的父组件
        
        instance.subTree = subTree
        instance.isMounted = true
        if (m) {
          invokeArrayFns(m)
        }
      } else { // 组件内部更新, 即非props更新
        const { next, bu, u } = instance
        if (next) {
          // 页面更新前,先更新属性
          updateComponentPreRender(instance, next)
        }
        if (bu) {
          invokeArrayFns(bu)
        }
        // const subTree = render.call(instance.proxy, instance.proxy)
        const subTree = renderComponent(instance)
        patch(instance.subTree, subTree, container, anchor, instance)
        instance.subTree = subTree
        if (u) {
          invokeArrayFns(u)
        }
      }
    }
    const effect = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update))
    const update = instance.update = effect.run.bind(effect)
    update()
  }

  const shouldUpdateComponent = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1
    const { props: nextProps, children: nextChildren } = n2
    if (prevChildren || nextChildren) return true // 有孩子一定更新
    if (prevProps === nextProps) return false
    return hasPropsChange(prevProps, nextProps)
  }

  const updateComponent = (n1, n2) => {
    // instance.props 是响应式的
    const instance = (n2.component = n1.component) // 元素复用dom节点; 组件复用实例
    // const { props: prevProps } = n1
    // const { props: nextProps } = n2
    // updateProps(instance, prevProps, nextProps)

    // 以上3行代码优化
    // 需要更新强制调用组件update
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2 // 将新的虚拟节点【临时】放到next属性上
      instance.update() // 统一调用update方法更新
    }
  }
  const processComponent = (n1, n2, container, anchor, parentComponent) => { // 普通组件&函数式组件
    if (n1 === null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        parentComponent.ctx.activate(n2, container, anchor)
      } else {
        mountComponent(n2, container, anchor, parentComponent)
      }
    } else { // 组件更新靠的是props
      updateComponent(n1, n2)
    }
  }

  const patch = (n1, n2, container, anchor = null, parentComponent = null) => { // n2可能是文本
    if (n1 === n2) return

    if (n1 && !isSameVnode(n1, n2)) { // 判断两个元素是否相同, 不相同先卸载再添加
      unmount(n1, parentComponent)
      n1 = null
    }

    const { type, shapeFlag } = n2

    switch (type) {
      case Text:
        processText(n1, n2, container)
        break;
      case Fragment: // 虚拟标签
        processFragment(n1, n2, container, parentComponent)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            move(vnode, container) {
              hostInsert(
                vnode.component ?
                  vnode.component.subTree.el :
                  vnode.el,
                container
              )
            }
          })
        }
    }
  }

  const unmount = (vnode, parentComponent) => {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children, parentComponent)
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      return parentComponent.ctx.deactivate(vnode)
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      return unmount(vnode.component.subTree, null)
    }
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => { // 渲染过程是用传入的renderOptions来渲染
    if (vnode === null) { // 卸载
      if (container._vnode) { // 之前渲染过, 才卸载
        unmount(container._vnode, null)
      }
    } else { // 初始化 & 更新
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render
  }
}