import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traversal(value, set = new Set()) { // set解决对象中循环引用问题
  if (!isObject(value)) return value;
  if (set.has(value)) { // 循环引用, 肯定走过set.add, 所以直接返回
    return value
  }
  set.add(value)
  for (const key in value) {
    traversal(value[key], set)
  }
  return value
}

export function watch(source, cb) {
  let getter;
  if (isReactive(source)) {
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }

  let cleanup;
  const onCleanup = (fn) => {
    cleanup = fn
  }

  let oldValue
  const job = () => {
    if (cleanup) cleanup() // 值改变时 触发上一次watch清理
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter, job) // 数据变化执行scheduler, 即job
  oldValue = effect.run()
}