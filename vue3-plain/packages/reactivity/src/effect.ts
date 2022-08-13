import { recordEffectScope } from "./effectScope"

export let activeEffect = undefined

function cleanupEffect(effect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  public parent = null
  public deps = [] // 收集当前effect的Set
  public active = true
  constructor(public fn, public scheduler?) {
    recordEffectScope(this)
  }
  run() {
    if (!this.active) {
      return this.fn()
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      cleanupEffect(this) // 清空之前的依赖
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = null
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

export function effect(fn, options:any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run() // 默认执行一次

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// { 对象：{ name: [] } }
// WeakMap = { 对象: Map: { name: Set }}
const targetMap = new WeakMap()
export function track(target, type, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffects(dep)
}

export function trackEffects(dep) {
  if (activeEffect) {
    let shouldTrack = !dep.has(activeEffect) // 去重
    if (shouldTrack) {
      activeEffect.deps.push(dep) // effect记录dep, 即Set
      dep.add(activeEffect)
    }
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  let effects = depsMap.get(key)
  if (effects) {
    triggerEffect(effects)
  }
}

export function triggerEffect(effects) {
  effects = new Set(effects) // copy 一份
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}