import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffects, triggerEffect } from "./effect"

class ComputedRefImpl {
  public effect
  public _dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep = new Set; // 没有入参 可以不加括号

  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerEffect(this.dep)
      }
    })
  }

  get value() {
    trackEffects(this.dep)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newVal) {
    this.setter(newVal)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions)
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => { console.warn('no setter') }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}