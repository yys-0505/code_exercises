import { ref } from "@vue/reactivity"
import { h } from "./h"
import { Fragment } from "./vnode"

export const defineAsyncComponent = (options) => {
  if (typeof options === 'function') {
    options = { loader: options }
  }
  return {
    setup() {
      const loaded = ref(false)
      const error = ref(false)
      const loading = ref(false)
      const { loader, timeout, errorComponent, delay, loadingComponent, onError } = options
      
      if (delay) {
        setTimeout(() => {
          loading.value = true
        }, delay)
      }

      let Comp = null

      function load() {
        return loader().catch(err => {
          if (onError) {
            return new Promise((resolve, reject) => {
              const retry = () => {
                resolve(load()) // 等load() resolve后再执行这里的resolve
              } // 成功走下面的then方法
              const fail = () => reject(err) // 失败走下面的catch方法
              onError(err, retry, fail)
            })
          }
        })
      }

      load().then(c => { // 如果失败, 这里的then回调是上面new Promise的
        Comp = c
        loaded.value = true
      }).catch((err) => {
        error.value = err
      }).finally(() => {
        loading.value = false
      })

      setTimeout(() => {
        error.value = true
      }, timeout);
      return () => {
        if (loaded.value) {
          return h(Comp)
        } else if (error.value && errorComponent) {
          return h(errorComponent)
        } else if (loading.value && loadingComponent) {
          return h(loadingComponent)
        } else {
          return h(Fragment, [])
        }
      }
    }
  }
}