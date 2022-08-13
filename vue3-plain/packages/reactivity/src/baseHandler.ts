import { isObject } from "@vue/shared"
import { activeEffect, track, trigger } from "./effect"
import { reactive } from "./reactive"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, receiver) { // receiver就是proxy对象
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)

    const res = Reflect.get(target, key, receiver) // reveiver保证target中的this是proxy对象

    if (isObject(res)) { // 深度代理
      return reactive(res)
    }

    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}