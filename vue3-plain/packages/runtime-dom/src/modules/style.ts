export function patchStyle(el, prevValue, nextValue = {}) {
  for (let key in nextValue) {
    el.style[key] = nextValue[key] // 新值直接放到el.style上, 允许出现覆盖
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] === null) { // 有些旧值需要删除
        el.style[key] = null
      }
    }
  }
}