function createInvoker(callback) {
  const invoker = (e) => invoker.value(e)
  invoker.value = callback
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  // 先移除 再重新添加 优化成：add + 自定义事件
  let invokers = el._vei || (el._vei = {}) // vei: vue event invoker
  let exist = invokers[eventName] // 是否缓存过

  if (exist && nextValue) { // 当前元素已绑定过该类型事件, 如onClick
    exist.value = nextValue
  } else { // 未绑定
    let event = eventName.slice(2).toLowerCase() // onClick => click
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    } else if (exist) { // 无新 但有老
      el.removeEventListener(event, exist)
      invokers[eventName] = undefined
    }
  }
}