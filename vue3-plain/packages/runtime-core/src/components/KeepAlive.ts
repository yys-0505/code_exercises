import { ShapeFlags } from "@vue/shared"
import { onMounted, onUpdated } from "../apiLifecycle"
import { getCurrentInstance } from "../component"
import { isVnode } from "../vnode"

function resetShapeFlag(vnode) {
  let shapeFlag = vnode.shapeFlag
  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  }
  if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE
  }
  vnode.shapeFlag = shapeFlag
}

export const KeepAliveImpl = {
  __isKeepAlive: true,
  props: {
    include: {}, // 缓存哪些
    exclude: {}, // 'a,b,c' ['a', 'b', 'c'] 或reg
    max: {}
  },
  setup(props, { slots }) {
    const keys = new Set() // 缓存的key
    const cache = new Map() // 哪个key对应的哪个虚拟节点

    const instance = getCurrentInstance()
    const { createElement, move } = instance.ctx.renderer
    const storageContainer = createElement('div')

    instance.ctx.deactivate = function(vnode) {
      move(vnode, storageContainer)
    }
    instance.ctx.activate = function(vnode, container, anchor) {
      move(vnode, container, anchor)
    }

    let pendingCacheKey = null
    function cacheSubTree() {
      if (pendingCacheKey) {
        cache.set(pendingCacheKey, instance.subTree) // 挂载完毕后缓存subTree
      }
    }
    onMounted(cacheSubTree)
    onUpdated(cacheSubTree)

    const { include, exclude, max } = props

    let current;
    function pruneCacheEntry(key) {
      resetShapeFlag(current)
      keys.delete(key)
      cache.delete(key)
    }

    return () => {
      const vnode = slots.default() // 啥也没干, 只是把子组件返回

      if (!isVnode(vnode) || !(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) {
        return vnode
      }

      // 必须是虚拟节点, 且是状态组件
      const comp = vnode.type
      const key = vnode.key == null ? comp : vnode.key

      const name = comp.name
      if (name && (include && !include.split(',').includes(name)) ||
        (exclude && exclude.split(',').includes(name))
      ) {
        return vnode
      }

      const cacheVnode = cache.get(key)
      if (cacheVnode) {
        vnode.component = cacheVnode.component
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE // 初始化不要走创建
        keys.delete(key)
        keys.add(key)
      } else {
        keys.add(key) // 缓存key
        pendingCacheKey = key

        if (max && keys.size > max) {
          // 迭代器 { next() => { value: done }}
          pruneCacheEntry(keys.values().next().value)
        }
      }
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
      current = vnode
      return vnode
    }
  }
}

export const isKeepAlive = vnode => vnode.type.__isKeepAlive