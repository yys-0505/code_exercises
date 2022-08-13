import { currentInstance } from "./component";

export function provide(key, value) {
  if (!currentInstance) return // 只能在setup中使用

  const parentProvides = currentInstance.parent && currentInstance.parent.provides

  let provides = currentInstance.provides // 自己的provides
  if (parentProvides === provides) {
    provides = currentInstance.provides = Object.create(provides)
  }
  
  provides[key] = value
}

export function inject(key, defaultVal) {
  if (!currentInstance) return // 只能在setup中使用
  const provides = currentInstance.parent && currentInstance.parent.provides
  if (provides && (key in provides)) {
    return provides[key]
  } else if (arguments.length > 1) {
    return defaultVal
  }
}