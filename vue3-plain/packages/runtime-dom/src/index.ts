import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

// 使用 createRenderer(renderOptions)
const renderOptions = Object.assign(nodeOps, { patchProp })

export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container)
}

export * from '@vue/runtime-core'