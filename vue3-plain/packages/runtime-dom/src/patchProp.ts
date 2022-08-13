import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// dom属性的操作
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    // 值 -> null 删除class
    // null -> 值 直接覆盖
    // 值 -> 值 直接覆盖
    patchClass(el, nextValue)
  } else if (key === 'style') {
    // el style { color: 'red', fontSize: x } { color: 'blue'} 新的blue直接生效; fontSize清空
    patchStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) { // onClick等事件
    patchEvent(el, key, nextValue)
  } else { // 普通属性
    patchAttr(el, key, nextValue)
  }
}